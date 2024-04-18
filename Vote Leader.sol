// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract LeaderElection {
    struct Candidate {
        uint256 voteCount;
        bool exists;
    }

    address public leader;

    mapping(address => Candidate) public candidates;
    address[] private candidateList;  // Array to keep track of candidate addresses

    event Voted(address indexed voter, address indexed candidate);
    event Unvoted(address indexed voter, address indexed candidate);

    modifier onlyNotVoted() {
        require(!candidates[msg.sender].exists, "You have already voted");
        _;
    }

    constructor(address[] memory _candidates) {
        require(_candidates.length >= 3, "At least 3 candidates required");

        for (uint256 i = 0; i < _candidates.length; i++) {
            candidates[_candidates[i]] = Candidate(0, true);
            candidateList.push(_candidates[i]);  
        }
    }

    function vote(address _candidate) external onlyNotVoted {
        require(candidates[_candidate].exists, "Candidate does not exist");

        candidates[_candidate].voteCount++;

        candidates[msg.sender] = Candidate(0, true);  

        emit Voted(msg.sender, _candidate);
    }

    function unVote(address _candidate) external onlyNotVoted {
        require(candidates[_candidate].voteCount > 0, "No votes to undo");

        candidates[_candidate].voteCount--;

        delete candidates[msg.sender];  

        emit Unvoted(msg.sender, _candidate);
    }

 
    function getCandidates() public view returns (address[] memory, uint256[] memory) {
        uint256 numCandidates = candidateList.length;
        
        address[] memory addresses = new address[](numCandidates);
        uint256[] memory votes = new uint256[](numCandidates);

        for (uint256 i = 0; i < numCandidates; i++) {
            addresses[i] = candidateList[i];
            votes[i] = candidates[candidateList[i]].voteCount;
        }

        return (addresses, votes);
    }
}