"""
Flask Web Application for Decentralized Voting System
Provides a modern web UI for voting, candidate management, and blockchain visualization
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import sys
import hashlib
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import Blockchain

app = Flask(__name__)
app.secret_key = 'supersecretkeyforvotingsystem'  # In production, use a strong secret key
blockchain = Blockchain()

# Admin credentials (in production, store in secure database)
ADMIN_CREDENTIALS = {
    'username': 'admin',
    'password': hashlib.sha256('admin123'.encode()).hexdigest()  # sha256 of 'admin123'
}

# Route for the main dashboard
@app.route('/')
def index():
    """Redirect to appropriate dashboard based on user type"""
    # Check if user is admin
    if session.get('is_admin', False):
        return redirect(url_for('admin_dashboard'))
    else:
        return redirect(url_for('user_dashboard'))

@app.route('/admin')
def admin_dashboard():
    """Admin dashboard showing detailed blockchain information"""
    if not session.get('is_admin', False):
        return redirect(url_for('login'))
        
    vote_counts = blockchain.count_votes()
    total_votes = sum(vote_counts.values())
    
    # Prepare data for charts
    candidates_data = []
    for candidate_id, count in sorted(vote_counts.items(), key=lambda x: x[1], reverse=True):
        candidate_name = blockchain.candidates.get(candidate_id, candidate_id)
        percentage = (count / total_votes * 100) if total_votes > 0 else 0
        candidates_data.append({
            'id': candidate_id,
            'name': candidate_name,
            'votes': count,
            'percentage': round(percentage, 1)
        })
    
    # Blockchain info
    blockchain_info = blockchain.get_blockchain_info()
    
    # Get all blocks for admin view
    all_blocks = []
    for block in blockchain.chain[1:]:  # Skip genesis block
        candidate_name = blockchain.candidates.get(block.candidate_id, "Unknown")
        all_blocks.append({
            'block_number': block.index,
            'timestamp': block.timestamp,
            'voter_id_hash': block.voter_id,
            'candidate_id': block.candidate_id,
            'candidate_name': candidate_name,
            'block_hash': block.block_hash
        })
    
    return render_template('admin_dashboard.html', 
                         candidates=candidates_data,
                         total_votes=total_votes,
                         blockchain_info=blockchain_info,
                         all_blocks=all_blocks)

@app.route('/user')
def user_dashboard():
    """User dashboard showing public vote counts"""
    vote_counts = blockchain.count_votes()
    total_votes = sum(vote_counts.values())
    
    # Prepare data for charts
    candidates_data = []
    for candidate_id, count in sorted(vote_counts.items(), key=lambda x: x[1], reverse=True):
        candidate_name = blockchain.candidates.get(candidate_id, candidate_id)
        percentage = (count / total_votes * 100) if total_votes > 0 else 0
        candidates_data.append({
            'id': candidate_id,
            'name': candidate_name,
            'votes': count,
            'percentage': round(percentage, 1)
        })
    
    # Blockchain info
    blockchain_info = blockchain.get_blockchain_info()
    
    return render_template('user_dashboard.html', 
                         candidates=candidates_data,
                         total_votes=total_votes,
                         blockchain_info=blockchain_info)

# Route for casting votes
@app.route('/vote', methods=['GET', 'POST'])
def vote():
    """Vote casting interface"""
    if request.method == 'POST':
        voter_id = request.form.get('voter_id')
        candidate_id = request.form.get('candidate_id')
        
        if not voter_id or not candidate_id:
            return jsonify({'success': False, 'message': 'Please provide both voter ID and candidate'})
        
        success = blockchain.add_vote(voter_id, candidate_id)
        if success:
            return jsonify({'success': True, 'message': 'Vote recorded successfully!'})
        else:
            return jsonify({'success': False, 'message': 'Vote not recorded. You may have already voted or candidate is invalid.'})
    
    return render_template('vote.html', candidates=blockchain.candidates)

# Route for viewing detailed blockchain
@app.route('/blockchain')
def view_blockchain():
    """Display complete blockchain with voter-candidate mappings"""
    blockchain_data = []
    
    # Skip genesis block for display
    for i, block in enumerate(blockchain.chain[1:], 1):
        candidate_name = blockchain.candidates.get(block.candidate_id, "Unknown")
        blockchain_data.append({
            'block_number': block.index,
            'timestamp': block.timestamp,
            'voter_id_hash': block.voter_id[:16] + "...",  # Show shortened hash
            'candidate_id': block.candidate_id,
            'candidate_name': candidate_name,
            'block_hash': block.block_hash[:16] + "..."
        })
    
    return render_template('blockchain.html', blockchain=blockchain_data)

# Route for candidate management
@app.route('/candidates', methods=['GET', 'POST'])
def manage_candidates():
    """Add/remove candidates - Admin only"""
    if not session.get('is_admin', False):
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'add':
            candidate_id = request.form.get('candidate_id')
            candidate_name = request.form.get('candidate_name')
            
            if candidate_id and candidate_name:
                # Load existing candidates
                candidates = blockchain._load_candidates()
                candidates[candidate_id] = candidate_name
                blockchain._save_candidates(candidates)
                blockchain.candidates = candidates
                return jsonify({'success': True, 'message': 'Candidate added successfully'})
        
        elif action == 'remove':
            candidate_id = request.form.get('candidate_id')
            if candidate_id and candidate_id in blockchain.candidates:
                candidates = blockchain._load_candidates()
                del candidates[candidate_id]
                blockchain._save_candidates(candidates)
                blockchain.candidates = candidates
                return jsonify({'success': True, 'message': 'Candidate removed successfully'})
    
    return render_template('candidates.html', candidates=blockchain.candidates)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Hash the entered password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        if username == ADMIN_CREDENTIALS['username'] and hashed_password == ADMIN_CREDENTIALS['password']:
            session['is_admin'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            return render_template('login.html', error="Invalid credentials")
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout route"""
    session.pop('is_admin', None)
    return redirect(url_for('user_dashboard'))

@app.route('/admin/blockchain')
def admin_blockchain():
    """Detailed blockchain view for admins"""
    if not session.get('is_admin', False):
        return redirect(url_for('login'))
        
    blockchain_data = []
    
    # Include all blocks including genesis for admin view
    for i, block in enumerate(blockchain.chain):
        candidate_name = blockchain.candidates.get(block.candidate_id, "Unknown")
        blockchain_data.append({
            'block_number': block.index,
            'timestamp': block.timestamp,
            'voter_id_hash': block.voter_id,
            'candidate_id': block.candidate_id,
            'candidate_name': candidate_name,
            'previous_hash': block.previous_hash,
            'block_hash': block.block_hash
        })
    
    return render_template('admin_blockchain.html', blockchain=blockchain_data)

# API endpoints for real-time data
@app.route('/api/vote_counts')
def api_vote_counts():
    """API endpoint for vote counts"""
    vote_counts = blockchain.count_votes()
    total_votes = sum(vote_counts.values())
    
    data = []
    for candidate_id, count in vote_counts.items():
        candidate_name = blockchain.candidates.get(candidate_id, candidate_id)
        percentage = (count / total_votes * 100) if total_votes > 0 else 0
        data.append({
            'candidate_id': candidate_id,
            'candidate_name': candidate_name,
            'votes': count,
            'percentage': round(percentage, 1)
        })
    
    return jsonify({
        'votes': data,
        'total_votes': total_votes,
        'timestamp': blockchain.chain[-1].timestamp if blockchain.chain else None
    })

@app.route('/api/blockchain_info')
def api_blockchain_info():
    """API endpoint for blockchain information"""
    return jsonify(blockchain.get_blockchain_info())

@app.route('/api/integrity_check')
def api_integrity_check():
    """API endpoint for blockchain integrity verification"""
    is_valid = blockchain.verify_integrity()
    return jsonify({'valid': is_valid})

# Navigation routes
@app.route('/vote')
def vote_page():
    """Vote casting page - accessible to all users"""
    return render_template('vote.html', candidates=blockchain.candidates)

@app.route('/blockchain')
def blockchain_public():
    """Public blockchain view"""
    blockchain_data = []
    
    # Skip genesis block for public view
    for i, block in enumerate(blockchain.chain[1:], 1):
        candidate_name = blockchain.candidates.get(block.candidate_id, "Unknown")
        blockchain_data.append({
            'block_number': block.index,
            'timestamp': block.timestamp,
            'candidate_name': candidate_name,
            'block_hash': block.block_hash[:16] + "..."
        })
    
    return render_template('blockchain_public.html', blockchain=blockchain_data)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    print("Starting Decentralized Voting System Web Interface...")
    print("Visit http://localhost:5000 to access the voting dashboard")
    app.run(debug=True, host='0.0.0.0', port=5000)