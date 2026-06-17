// ==================== AUTH ====================
export interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
}

// ==================== ELECTIONS ====================
export interface Election {
  id: number;
  title: string;
  year: string;
  status: 'active' | 'closed';
  created_at: string;
  closed_at: string | null;
}

// ==================== CLASSES ====================
export interface Class {
  id: number;
  name: string;
  election_id: number;
}

// ==================== STREAMS ====================
export interface Stream {
  id: number;
  name: string;
  class_id: number;
  total_students: number;
  class_name?: string;
}

// ==================== POSITIONS ====================
export interface Position {
  id: number;
  title: string;
  election_id: number;
}

// ==================== CANDIDATES ====================
export interface Candidate {
  id: number;
  name: string;
  position_id: number;
}

// ==================== VOTES ====================
export interface VoteSubmission {
  id: number;
  stream_id: number;
  stream_name: string;
  class_name: string;
  teacher_username: string;
  submitted_at: string;
}

// ==================== RESULTS ====================
export interface CandidateResult {
  candidate_id: number;
  candidate_name: string;
  votes: number;
  rank: number;
}

export interface ElectionResults {
  [positionTitle: string]: CandidateResult[];
}

// ==================== SETTINGS ====================
export interface SystemSettings {
  voting_open: boolean;
  display_type: 'graphs' | 'counts';
  current_election: Election | null;
}

// ==================== NOTIFICATIONS ====================
export interface Notification {
  id: number;
  message: string;
  position_name: string;
  attempted_total: number;
  max_allowed: number;
  is_read: boolean;
  created_at: string;
}