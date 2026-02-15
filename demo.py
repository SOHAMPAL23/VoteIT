"""
Test script for the Decentralized Voting System
This script demonstrates the core functionality without user interaction
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import Blockchain

def run_demonstration():
    """Run a complete demonstration of the voting system"""
    print("=" * 60)
    print("DEMONSTRATION: Decentralized Voting System")
    print("=" * 60)
    
    # Initialize blockchain
    print("\n1. Initializing blockchain...")
    blockchain = Blockchain()
    print(f"   Blockchain initialized with {len(blockchain.chain)} blocks")
    
    # Display candidates
    print("\n2. Available candidates:")
    for candidate_id, candidate_name in blockchain.candidates.items():
        print(f"   {candidate_id}: {candidate_name}")
    
    # Cast test votes
    print("\n3. Casting test votes...")
    test_votes = [
        ("voter_001", "CAND001"),
        ("voter_002", "CAND002"),
        ("voter_003", "CAND001"),
        ("voter_004", "CAND003"),
        ("voter_005", "CAND001")
    ]
    
    successful_votes = 0
    for voter_id, candidate_id in test_votes:
        if blockchain.add_vote(voter_id, candidate_id):
            successful_votes += 1
    
    print(f"   Successfully cast {successful_votes} votes")
    
    # Display vote count
    print("\n4. Current vote count:")
    vote_counts = blockchain.count_votes()
    total_votes = sum(vote_counts.values())
    
    for candidate_id, count in sorted(vote_counts.items(), key=lambda x: x[1], reverse=True):
        candidate_name = blockchain.candidates[candidate_id]
        percentage = (count / total_votes * 100) if total_votes > 0 else 0
        print(f"   {candidate_name:15} | {count:2} votes ({percentage:5.1f}%)")
    
    # Verify blockchain integrity
    print("\n5. Blockchain integrity verification:")
    is_valid = blockchain.verify_integrity()
    print(f"   Blockchain integrity: {'✓ VALID' if is_valid else '✗ INVALID'}")
    
    # Display blockchain info
    print("\n6. Blockchain summary:")
    info = blockchain.get_blockchain_info()
    print(f"   Total blocks: {info['total_blocks']}")
    print(f"   Total votes: {info['total_votes']}")
    print(f"   Blockchain valid: {'Yes' if info['is_valid'] else 'No'}")
    
    # Show some blockchain data
    print("\n7. Sample blockchain data:")
    print(f"   Genesis block hash: {blockchain.chain[0].block_hash[:16]}...")
    if len(blockchain.chain) > 1:
        print(f"   Latest block hash: {blockchain.chain[-1].block_hash[:16]}...")
        print(f"   Latest voter hash: {blockchain.chain[-1].voter_id[:16]}...")
    
    print("\n" + "=" * 60)
    print("DEMONSTRATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    run_demonstration()