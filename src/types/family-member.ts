export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  color: string;
  date_of_birth: string | null;
  relationship: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FamilyMemberInput {
  name: string;
  color?: string;
  date_of_birth?: string | null;
  relationship?: string | null;
}
