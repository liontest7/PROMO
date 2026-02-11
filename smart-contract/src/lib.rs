use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum DropyInstruction {
    InitializeCampaign { campaign_id: u64 },
    DepositRewards { campaign_id: u64, amount: u64 },
    ClaimReward {
        campaign_id: u64,
        amount: u64,
        nonce: u64,
    },
    CloseCampaign { campaign_id: u64 },
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct CampaignState {
    pub campaign_id: u64,
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub vault: Pubkey,
    pub total_deposited: u64,
    pub total_claimed: u64,
    pub last_nonce: u64,
    pub is_closed: bool,
}

impl CampaignState {
    pub fn size() -> usize {
        // campaign_id + owner + token_mint + vault + total_deposited + total_claimed + last_nonce + is_closed
        8 + 32 + 32 + 32 + 8 + 8 + 8 + 1
    }
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let instruction = DropyInstruction::try_from_slice(input)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        DropyInstruction::InitializeCampaign { campaign_id } => {
            initialize_campaign(program_id, accounts, campaign_id)
        }
        DropyInstruction::DepositRewards { campaign_id, amount } => {
            deposit_rewards(program_id, accounts, campaign_id, amount)
        }
        DropyInstruction::ClaimReward {
            campaign_id,
            amount,
            nonce,
        } => claim_reward(program_id, accounts, campaign_id, amount, nonce),
        DropyInstruction::CloseCampaign { campaign_id } => {
            close_campaign(program_id, accounts, campaign_id)
        }
    }
}

fn initialize_campaign(program_id: &Pubkey, accounts: &[AccountInfo], campaign_id: u64) -> ProgramResult {
    let mut accounts_iter = accounts.iter();
    let owner = next_account_info(&mut accounts_iter)?;
    let campaign_state_account = next_account_info(&mut accounts_iter)?;
    let token_mint = next_account_info(&mut accounts_iter)?;
    let vault = next_account_info(&mut accounts_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if campaign_state_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    if campaign_state_account.data_len() < CampaignState::size() {
        return Err(ProgramError::AccountDataTooSmall);
    }

    let (expected_state_pda, _) = Pubkey::find_program_address(
        &[b"campaign", &campaign_id.to_le_bytes()],
        program_id,
    );
    if campaign_state_account.key != &expected_state_pda {
        return Err(ProgramError::InvalidSeeds);
    }

    let (expected_vault_pda, _) = Pubkey::find_program_address(
        &[b"vault", &campaign_id.to_le_bytes()],
        program_id,
    );
    if vault.key != &expected_vault_pda {
        return Err(ProgramError::InvalidSeeds);
    }

    let state = CampaignState {
        campaign_id,
        owner: *owner.key,
        token_mint: *token_mint.key,
        vault: *vault.key,
        total_deposited: 0,
        total_claimed: 0,
        last_nonce: 0,
        is_closed: false,
    };

    state
        .serialize(&mut &mut campaign_state_account.data.borrow_mut()[..])
        .map_err(|_| ProgramError::AccountDataTooSmall)?;

    msg!("Initialize campaign {} complete", campaign_id);
    Ok(())
}

fn deposit_rewards(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    campaign_id: u64,
    amount: u64,
) -> ProgramResult {
    if amount == 0 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut accounts_iter = accounts.iter();
    let owner = next_account_info(&mut accounts_iter)?;
    let campaign_state_account = next_account_info(&mut accounts_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if campaign_state_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut state = CampaignState::try_from_slice(&campaign_state_account.data.borrow())
        .map_err(|_| ProgramError::InvalidAccountData)?;

    if state.campaign_id != campaign_id {
        return Err(ProgramError::InvalidAccountData);
    }

    if state.is_closed {
        return Err(ProgramError::InvalidAccountData);
    }

    if state.owner != *owner.key {
        return Err(ProgramError::IllegalOwner);
    }

    state.total_deposited = state
        .total_deposited
        .checked_add(amount)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    state
        .serialize(&mut &mut campaign_state_account.data.borrow_mut()[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;

    msg!("Deposit rewards for campaign {} amount {}", campaign_id, amount);
    Ok(())
}

fn claim_reward(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    campaign_id: u64,
    amount: u64,
    nonce: u64,
) -> ProgramResult {
    if amount == 0 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut accounts_iter = accounts.iter();
    let authority = next_account_info(&mut accounts_iter)?;
    let campaign_state_account = next_account_info(&mut accounts_iter)?;
    let _recipient = next_account_info(&mut accounts_iter)?;

    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if campaign_state_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut state = CampaignState::try_from_slice(&campaign_state_account.data.borrow())
        .map_err(|_| ProgramError::InvalidAccountData)?;

    if state.campaign_id != campaign_id || state.is_closed {
        return Err(ProgramError::InvalidAccountData);
    }

    if nonce <= state.last_nonce {
        return Err(ProgramError::InvalidInstructionData);
    }

    let remaining = state
        .total_deposited
        .checked_sub(state.total_claimed)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    if amount > remaining {
        return Err(ProgramError::InsufficientFunds);
    }

    state.total_claimed = state
        .total_claimed
        .checked_add(amount)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    state.last_nonce = nonce;

    state
        .serialize(&mut &mut campaign_state_account.data.borrow_mut()[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;

    msg!(
        "Claim reward for campaign {} amount {} nonce {}",
        campaign_id,
        amount,
        nonce
    );
    Ok(())
}

fn close_campaign(program_id: &Pubkey, accounts: &[AccountInfo], campaign_id: u64) -> ProgramResult {
    let mut accounts_iter = accounts.iter();
    let owner = next_account_info(&mut accounts_iter)?;
    let campaign_state_account = next_account_info(&mut accounts_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if campaign_state_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut state = CampaignState::try_from_slice(&campaign_state_account.data.borrow())
        .map_err(|_| ProgramError::InvalidAccountData)?;

    if state.campaign_id != campaign_id {
        return Err(ProgramError::InvalidAccountData);
    }

    if state.owner != *owner.key {
        return Err(ProgramError::IllegalOwner);
    }

    if state.total_claimed < state.total_deposited {
        // safe reclaim logic: close only after payouts are fully accounted for
        return Err(ProgramError::Custom(1));
    }

    state.is_closed = true;

    state
        .serialize(&mut &mut campaign_state_account.data.borrow_mut()[..])
        .map_err(|_| ProgramError::InvalidAccountData)?;

    msg!("Close campaign {}", campaign_id);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn new_account<'a>(
        key: &'a Pubkey,
        owner: &'a Pubkey,
        lamports: &'a mut u64,
        data: &'a mut [u8],
        is_signer: bool,
    ) -> AccountInfo<'a> {
        AccountInfo::new(key, is_signer, true, lamports, data, owner, false, 0)
    }

    fn serialize(instruction: &DropyInstruction) -> Vec<u8> {
        instruction
            .try_to_vec()
            .expect("instruction should serialize")
    }

    #[test]
    fn initialize_and_deposit_and_claim_and_close_flow() {
        let program_id = Pubkey::new_unique();
        let owner_key = Pubkey::new_unique();
        let token_mint_key = Pubkey::new_unique();
        let recipient_key = Pubkey::new_unique();
        let campaign_id = 42_u64;

        let (campaign_pda, _) = Pubkey::find_program_address(
            &[b"campaign", &campaign_id.to_le_bytes()],
            &program_id,
        );
        let (vault_pda, _) = Pubkey::find_program_address(
            &[b"vault", &campaign_id.to_le_bytes()],
            &program_id,
        );

        let mut owner_lamports = 0_u64;
        let mut owner_data: [u8; 0] = [];
        let mut campaign_lamports = 0_u64;
        let mut campaign_data = vec![0_u8; CampaignState::size()];
        let mut mint_lamports = 0_u64;
        let mut mint_data: [u8; 0] = [];
        let mut vault_lamports = 0_u64;
        let mut vault_data: [u8; 0] = [];
        let mut recipient_lamports = 0_u64;
        let mut recipient_data: [u8; 0] = [];

        let owner = new_account(
            &owner_key,
            &program_id,
            &mut owner_lamports,
            &mut owner_data,
            true,
        );
        let campaign_state = new_account(
            &campaign_pda,
            &program_id,
            &mut campaign_lamports,
            &mut campaign_data,
            false,
        );
        let token_mint = new_account(
            &token_mint_key,
            &program_id,
            &mut mint_lamports,
            &mut mint_data,
            false,
        );
        let vault = new_account(
            &vault_pda,
            &program_id,
            &mut vault_lamports,
            &mut vault_data,
            false,
        );
        let recipient = new_account(
            &recipient_key,
            &program_id,
            &mut recipient_lamports,
            &mut recipient_data,
            false,
        );

        let init_ix = serialize(&DropyInstruction::InitializeCampaign { campaign_id });
        assert!(process_instruction(
            &program_id,
            &[owner.clone(), campaign_state.clone(), token_mint.clone(), vault.clone()],
            &init_ix,
        )
        .is_ok());

        let deposit_ix = serialize(&DropyInstruction::DepositRewards {
            campaign_id,
            amount: 1_000_000,
        });
        assert!(process_instruction(
            &program_id,
            &[owner.clone(), campaign_state.clone()],
            &deposit_ix,
        )
        .is_ok());

        let claim_ix = serialize(&DropyInstruction::ClaimReward {
            campaign_id,
            amount: 400_000,
            nonce: 1,
        });
        assert!(process_instruction(
            &program_id,
            &[owner.clone(), campaign_state.clone(), recipient.clone()],
            &claim_ix,
        )
        .is_ok());

        let claim_ix_2 = serialize(&DropyInstruction::ClaimReward {
            campaign_id,
            amount: 600_000,
            nonce: 2,
        });
        assert!(process_instruction(
            &program_id,
            &[owner.clone(), campaign_state.clone(), recipient],
            &claim_ix_2,
        )
        .is_ok());

        let close_ix = serialize(&DropyInstruction::CloseCampaign { campaign_id });
        assert!(process_instruction(&program_id, &[owner, campaign_state], &close_ix).is_ok());
    }

    #[test]
    fn claim_replay_nonce_fails() {
        let program_id = Pubkey::new_unique();
        let owner_key = Pubkey::new_unique();
        let campaign_id = 7_u64;
        let (campaign_pda, _) = Pubkey::find_program_address(
            &[b"campaign", &campaign_id.to_le_bytes()],
            &program_id,
        );
        let (vault_pda, _) = Pubkey::find_program_address(
            &[b"vault", &campaign_id.to_le_bytes()],
            &program_id,
        );
        let token_mint_key = Pubkey::new_unique();
        let recipient_key = Pubkey::new_unique();

        let mut owner_lamports = 0_u64;
        let mut owner_data: [u8; 0] = [];
        let mut campaign_lamports = 0_u64;
        let mut campaign_data = vec![0_u8; CampaignState::size()];
        let mut mint_lamports = 0_u64;
        let mut mint_data: [u8; 0] = [];
        let mut vault_lamports = 0_u64;
        let mut vault_data: [u8; 0] = [];
        let mut recipient_lamports = 0_u64;
        let mut recipient_data: [u8; 0] = [];

        let owner = new_account(
            &owner_key,
            &program_id,
            &mut owner_lamports,
            &mut owner_data,
            true,
        );
        let campaign_state = new_account(
            &campaign_pda,
            &program_id,
            &mut campaign_lamports,
            &mut campaign_data,
            false,
        );
        let token_mint = new_account(
            &token_mint_key,
            &program_id,
            &mut mint_lamports,
            &mut mint_data,
            false,
        );
        let vault = new_account(
            &vault_pda,
            &program_id,
            &mut vault_lamports,
            &mut vault_data,
            false,
        );
        let recipient = new_account(
            &recipient_key,
            &program_id,
            &mut recipient_lamports,
            &mut recipient_data,
            false,
        );

        let init_ix = serialize(&DropyInstruction::InitializeCampaign { campaign_id });
        process_instruction(
            &program_id,
            &[owner.clone(), campaign_state.clone(), token_mint, vault],
            &init_ix,
        )
        .unwrap();

        let deposit_ix = serialize(&DropyInstruction::DepositRewards {
            campaign_id,
            amount: 100,
        });
        process_instruction(&program_id, &[owner.clone(), campaign_state.clone()], &deposit_ix)
            .unwrap();

        let claim_ix = serialize(&DropyInstruction::ClaimReward {
            campaign_id,
            amount: 10,
            nonce: 1,
        });
        process_instruction(
            &program_id,
            &[owner.clone(), campaign_state.clone(), recipient.clone()],
            &claim_ix,
        )
        .unwrap();

        let replay_ix = serialize(&DropyInstruction::ClaimReward {
            campaign_id,
            amount: 10,
            nonce: 1,
        });

        let replay_res = process_instruction(
            &program_id,
            &[owner, campaign_state, recipient],
            &replay_ix,
        );
        assert_eq!(replay_res, Err(ProgramError::InvalidInstructionData));
    }

    #[test]
    fn close_fails_if_not_fully_claimed() {
        let program_id = Pubkey::new_unique();
        let owner_key = Pubkey::new_unique();
        let campaign_id = 9_u64;
        let (campaign_pda, _) = Pubkey::find_program_address(
            &[b"campaign", &campaign_id.to_le_bytes()],
            &program_id,
        );
        let (vault_pda, _) = Pubkey::find_program_address(
            &[b"vault", &campaign_id.to_le_bytes()],
            &program_id,
        );
        let token_mint_key = Pubkey::new_unique();

        let mut owner_lamports = 0_u64;
        let mut owner_data: [u8; 0] = [];
        let mut campaign_lamports = 0_u64;
        let mut campaign_data = vec![0_u8; CampaignState::size()];
        let mut mint_lamports = 0_u64;
        let mut mint_data: [u8; 0] = [];
        let mut vault_lamports = 0_u64;
        let mut vault_data: [u8; 0] = [];

        let owner = new_account(
            &owner_key,
            &program_id,
            &mut owner_lamports,
            &mut owner_data,
            true,
        );
        let campaign_state = new_account(
            &campaign_pda,
            &program_id,
            &mut campaign_lamports,
            &mut campaign_data,
            false,
        );
        let token_mint = new_account(
            &token_mint_key,
            &program_id,
            &mut mint_lamports,
            &mut mint_data,
            false,
        );
        let vault = new_account(
            &vault_pda,
            &program_id,
            &mut vault_lamports,
            &mut vault_data,
            false,
        );

        let init_ix = serialize(&DropyInstruction::InitializeCampaign { campaign_id });
        process_instruction(
            &program_id,
            &[owner.clone(), campaign_state.clone(), token_mint, vault],
            &init_ix,
        )
        .unwrap();

        let deposit_ix = serialize(&DropyInstruction::DepositRewards {
            campaign_id,
            amount: 100,
        });
        process_instruction(&program_id, &[owner.clone(), campaign_state.clone()], &deposit_ix)
            .unwrap();

        let close_ix = serialize(&DropyInstruction::CloseCampaign { campaign_id });
        let close_res = process_instruction(&program_id, &[owner, campaign_state], &close_ix);
        assert_eq!(close_res, Err(ProgramError::Custom(1)));
    }
}
