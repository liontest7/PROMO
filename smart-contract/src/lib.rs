use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum DropyInstruction {
    InitializeCampaign { campaign_id: u64 },
    ClaimReward { campaign_id: u64, amount: u64 },
    CloseCampaign { campaign_id: u64 },
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let instruction = DropyInstruction::try_from_slice(input)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    let mut accounts_iter = accounts.iter();
    let signer = next_account_info(&mut accounts_iter)?;
    if !signer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    match instruction {
        DropyInstruction::InitializeCampaign { campaign_id } => {
            msg!("Initialize campaign {}", campaign_id);
        }
        DropyInstruction::ClaimReward { campaign_id, amount } => {
            msg!("Claim reward for campaign {} amount {}", campaign_id, amount);
        }
        DropyInstruction::CloseCampaign { campaign_id } => {
            msg!("Close campaign {}", campaign_id);
        }
    }

    Ok(())
}
