"""
Decentralized Voting System using Blockchain
Educational & Demonstration Purpose Only

This system implements a lightweight blockchain for voting where:
- Votes are stored as immutable blockchain transactions
- SHA-256 hashing ensures data integrity
- Voter privacy is maintained through ID hashing
- Anyone can audit votes and verify blockchain integrity

Author: Blockchain Security Engineer
Date: February 2026
"""

import hashlib
import json
import datetime
import os
from typing import List, Dict, Optional


class Block:
    """
    Represents a single block in the blockchain.
    
    Each block contains:
    - index: Position in the blockchain
    - timestamp: When the block was created
    - voter_id: Hashed voter identifier (for privacy)
    - candidate_id: The candidate voted for
    - previous_hash: Hash of the previous block (ensures immutability)
    - block_hash: Hash of this block's contents
    """
    
    def __init__(self, index: int, voter_id: str, candidate_id: str, previous_hash: str):
        self.index = index
        self.timestamp = datetime.datetime.now().isoformat()
        self.voter_id = voter_id  # Hashed for privacy
        self.candidate_id = candidate_id
        self.previous_hash = previous_hash
        self.block_hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """
        Calculate SHA-256 hash of the block contents.
        This ensures the block cannot be tampered with without detection.
        """
        block_string = f"{self.index}{self.timestamp}{self.voter_id}{self.candidate_id}{self.previous_hash}"
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict:
        """Convert block to dictionary for JSON serialization."""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'voter_id': self.voter_id,
            'candidate_id': self.candidate_id,
            'previous_hash': self.previous_hash,
            'block_hash': self.block_hash
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Block':
        """Create block from dictionary data."""
        block = cls(
            index=data['index'],
            voter_id=data['voter_id'],
            candidate_id=data['candidate_id'],
            previous_hash=data['previous_hash']
        )
        block.timestamp = data['timestamp']
        block.block_hash = data['block_hash']
        return block


class Blockchain:
    """
    Main blockchain class that manages the voting system.
    
    Features:
    - Genesis block initialization
    - Vote casting with duplicate prevention
    - Blockchain integrity verification
    - Vote counting and results calculation
    - Persistent storage
    """
    
    def __init__(self, data_dir: str = "data"):
        self.chain: List[Block] = []
        self.data_dir = data_dir
        self.candidates_file = os.path.join(data_dir, "candidates.json")
        self.blockchain_file = os.path.join(data_dir, "blockchain.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize the blockchain
        self._initialize_blockchain()
    
    def _initialize_blockchain(self):
        """Initialize blockchain with genesis block and load existing data."""
        # Load candidates
        self.candidates = self._load_candidates()
        
        # Load existing blockchain or create genesis block
        if os.path.exists(self.blockchain_file):
            self._load_blockchain()
        else:
            self._create_genesis_block()
    
    def _load_candidates(self) -> Dict[str, str]:
        """Load candidate data from file or create default candidates."""
        if os.path.exists(self.candidates_file):
            with open(self.candidates_file, 'r') as f:
                return json.load(f)
        else:
            # Default candidates for demonstration
            candidates = {
                "CAND001": "Alice Johnson",
                "CAND002": "Bob Smith",
                "CAND003": "Carol Davis"
            }
            self._save_candidates(candidates)
            return candidates
    
    def _save_candidates(self, candidates: Dict[str, str]):
        """Save candidate data to file."""
        with open(self.candidates_file, 'w') as f:
            json.dump(candidates, f, indent=2)
    
    def _create_genesis_block(self):
        """Create the first block in the blockchain."""
        genesis_block = Block(
            index=0,
            voter_id="GENESIS_BLOCK",
            candidate_id="SYSTEM_INITIALIZED",
            previous_hash="0"  # Genesis block has no previous hash
        )
        self.chain.append(genesis_block)
        self._save_blockchain()
        print("✓ Genesis block created successfully")
    
    def _load_blockchain(self):
        """Load blockchain from file."""
        try:
            with open(self.blockchain_file, 'r') as f:
                data = json.load(f)
                self.chain = [Block.from_dict(block_data) for block_data in data]
            print(f"✓ Loaded blockchain with {len(self.chain)} blocks")
        except Exception as e:
            print(f"Error loading blockchain: {e}")
            self._create_genesis_block()
    
    def _save_blockchain(self):
        """Save blockchain to file."""
        try:
            with open(self.blockchain_file, 'w') as f:
                json.dump([block.to_dict() for block in self.chain], f, indent=2)
        except Exception as e:
            print(f"Error saving blockchain: {e}")
    
    def hash_voter_id(self, voter_id: str) -> str:
        """
        Hash voter ID for privacy protection.
        This ensures voter anonymity while preventing duplicate votes.
        """
        return hashlib.sha256(voter_id.encode()).hexdigest()
    
    def has_voted(self, voter_id_hash: str) -> bool:
        """Check if a voter has already cast a vote."""
        return any(block.voter_id == voter_id_hash for block in self.chain[1:])  # Skip genesis block
    
    def is_valid_candidate(self, candidate_id: str) -> bool:
        """Verify that the candidate ID exists."""
        return candidate_id in self.candidates
    
    def add_vote(self, voter_id: str, candidate_id: str) -> bool:
        """
        Add a new vote to the blockchain.
        
        Returns:
            bool: True if vote was added successfully, False otherwise
        """
        # Validate inputs
        if not self.is_valid_candidate(candidate_id):
            print(f"✗ Invalid candidate ID: {candidate_id}")
            return False
        
        # Hash voter ID for privacy
        voter_id_hash = self.hash_voter_id(voter_id)
        
        # Check for duplicate vote
        if self.has_voted(voter_id_hash):
            print(f"✗ Voter {voter_id} has already voted")
            return False
        
        # Create new block
        new_block = Block(
            index=len(self.chain),
            voter_id=voter_id_hash,
            candidate_id=candidate_id,
            previous_hash=self.chain[-1].block_hash
        )
        
        # Add to chain and save
        self.chain.append(new_block)
        self._save_blockchain()
        
        print(f"✓ Vote recorded for {self.candidates[candidate_id]}")
        print(f"  Block #{new_block.index} added to blockchain")
        return True
    
    def count_votes(self) -> Dict[str, int]:
        """Count votes for each candidate."""
        vote_counts = {}
        
        # Initialize all candidates with zero votes
        for candidate_id in self.candidates:
            vote_counts[candidate_id] = 0
        
        # Count votes (skip genesis block)
        for block in self.chain[1:]:
            if block.candidate_id in vote_counts:
                vote_counts[block.candidate_id] += 1
        
        return vote_counts
    
    def verify_integrity(self) -> bool:
        """
        Verify blockchain integrity by checking hash links.
        Returns True if blockchain is valid, False if tampered with.
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
            
            # Verify current block's hash is correct
            if current_block.block_hash != current_block.calculate_hash():
                print(f"✗ Block {i}: Hash mismatch - blockchain may be tampered")
                return False
            
            # Verify previous hash link
            if current_block.previous_hash != previous_block.block_hash:
                print(f"✗ Block {i}: Previous hash mismatch - blockchain may be tampered")
                return False
        
        print("✓ Blockchain integrity verified - all blocks are valid")
        return True
    
    def get_blockchain_info(self) -> Dict:
        """Get summary information about the blockchain."""
        return {
            'total_blocks': len(self.chain),
            'total_votes': len(self.chain) - 1,  # Exclude genesis block
            'candidates': self.candidates,
            'is_valid': self.verify_integrity()
        }


def display_menu():
    """Display the main menu options."""
    print("\n" + "="*50)
    print("🗳️  DECENTRALIZED VOTING SYSTEM (BLOCKCHAIN)")
    print("="*50)
    print("1. Cast Vote")
    print("2. View Candidates")
    print("3. View Vote Count")
    print("4. View Blockchain")
    print("5. Verify Blockchain Integrity")
    print("6. Exit")
    print("="*50)


def display_candidates(blockchain: Blockchain):
    """Display available candidates."""
    print("\n📋 AVAILABLE CANDIDATES:")
    print("-" * 30)
    for candidate_id, candidate_name in blockchain.candidates.items():
        print(f"ID: {candidate_id} | Name: {candidate_name}")


def display_vote_count(blockchain: Blockchain):
    """Display current vote count."""
    vote_counts = blockchain.count_votes()
    
    print("\n📊 CURRENT VOTE COUNT:")
    print("-" * 30)
    
    total_votes = sum(vote_counts.values())
    if total_votes == 0:
        print("No votes have been cast yet.")
        return
    
    # Sort by vote count (descending)
    sorted_votes = sorted(vote_counts.items(), key=lambda x: x[1], reverse=True)
    
    for candidate_id, count in sorted_votes:
        candidate_name = blockchain.candidates[candidate_id]
        percentage = (count / total_votes) * 100 if total_votes > 0 else 0
        print(f"{candidate_name:20} | {count:3} votes ({percentage:5.1f}%)")


def display_blockchain(blockchain: Blockchain):
    """Display the entire blockchain."""
    print(f"\n🔗 BLOCKCHAIN (Total: {len(blockchain.chain)} blocks)")
    print("=" * 80)
    
    for i, block in enumerate(blockchain.chain):
        print(f"\nBlock #{block.index}")
        print(f"  Timestamp: {block.timestamp}")
        print(f"  Voter ID (hashed): {block.voter_id[:16]}...")
        print(f"  Candidate: {blockchain.candidates.get(block.candidate_id, block.candidate_id)}")
        print(f"  Previous Hash: {block.previous_hash[:16]}...")
        print(f"  Block Hash: {block.block_hash[:16]}...")
        print("-" * 50)


def cast_vote(blockchain: Blockchain):
    """Handle the vote casting process."""
    print("\n🗳️  CAST YOUR VOTE")
    print("-" * 20)
    
    # Display candidates
    display_candidates(blockchain)
    
    # Get voter input
    voter_id = input("\nEnter your voter ID (any unique identifier): ").strip()
    if not voter_id:
        print("✗ Voter ID cannot be empty")
        return
    
    candidate_id = input("Enter candidate ID: ").strip().upper()
    if not candidate_id:
        print("✗ Candidate ID cannot be empty")
        return
    
    # Process vote
    success = blockchain.add_vote(voter_id, candidate_id)
    if success:
        print("\n✅ Vote successfully recorded!")
    else:
        print("\n❌ Vote was not recorded. Please check the error above.")


def main():
    """Main application entry point."""
    print("Initializing Decentralized Voting System...")
    
    # Initialize blockchain
    try:
        blockchain = Blockchain()
        print("✓ Voting system initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize voting system: {e}")
        return
    
    # Main application loop
    while True:
        display_menu()
        choice = input("\nSelect an option (1-6): ").strip()
        
        if choice == '1':
            cast_vote(blockchain)
        elif choice == '2':
            display_candidates(blockchain)
        elif choice == '3':
            display_vote_count(blockchain)
        elif choice == '4':
            display_blockchain(blockchain)
        elif choice == '5':
            blockchain.verify_integrity()
        elif choice == '6':
            print("\n👋 Thank you for using the Decentralized Voting System!")
            print("Remember: This is for educational purposes only.")
            break
        else:
            print("✗ Invalid option. Please select 1-6.")


if __name__ == "__main__":
    main()