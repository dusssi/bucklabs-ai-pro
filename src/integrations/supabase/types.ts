export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          learning_level: "Beginner" | "Intermediate" | "Advanced";
          primary_goal: string | null;
          preferred_language: "Python" | "Java" | "C++" | "JavaScript" | "TypeScript";
          areas_of_interest: string[];
          target_role: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          learning_level?: "Beginner" | "Intermediate" | "Advanced";
          primary_goal?: string | null;
          preferred_language?: "Python" | "Java" | "C++" | "JavaScript" | "TypeScript";
          areas_of_interest?: string[];
          target_role?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          learning_level?: "Beginner" | "Intermediate" | "Advanced";
          primary_goal?: string | null;
          preferred_language?: "Python" | "Java" | "C++" | "JavaScript" | "TypeScript";
          areas_of_interest?: string[];
          target_role?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_paths: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          estimated_duration: string;
          target_role: string;
          prerequisites: string[];
          outcomes: string[];
          course_ids: string[];
          problem_ids: string[];
          published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          slug: string;
          description: string;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          estimated_duration: string;
          target_role: string;
          prerequisites?: string[];
          outcomes?: string[];
          course_ids?: string[];
          problem_ids?: string[];
          published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          difficulty?: "Beginner" | "Intermediate" | "Advanced";
          estimated_duration?: string;
          target_role?: string;
          prerequisites?: string[];
          outcomes?: string[];
          course_ids?: string[];
          problem_ids?: string[];
          published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          description: string;
          long_description: string;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          estimated_duration: string;
          lessons_count: number;
          instructor: string;
          tags: string[];
          prerequisites: string[];
          outcomes: string[];
          curriculum: Json;
          learning_path_id: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          slug: string;
          category: string;
          description: string;
          long_description: string;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          estimated_duration: string;
          lessons_count?: number;
          instructor: string;
          tags?: string[];
          prerequisites?: string[];
          outcomes?: string[];
          curriculum?: Json;
          learning_path_id?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          description?: string;
          long_description?: string;
          difficulty?: "Beginner" | "Intermediate" | "Advanced";
          estimated_duration?: string;
          lessons_count?: number;
          instructor?: string;
          tags?: string[];
          prerequisites?: string[];
          outcomes?: string[];
          curriculum?: Json;
          learning_path_id?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: "enrolled" | "in_progress" | "completed";
          progress: number;
          completed_modules: string[];
          started_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: "enrolled" | "in_progress" | "completed";
          progress?: number;
          completed_modules?: string[];
          started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          status?: "enrolled" | "in_progress" | "completed";
          progress?: number;
          completed_modules?: string[];
          started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      practice_problems: {
        Row: {
          id: string;
          title: string;
          slug: string;
          source: "LeetCode" | "Codeforces" | "HackerRank" | "BUCKLABS Original";
          canonical_url: string;
          difficulty: "Beginner" | "Easy" | "Medium" | "Hard";
          external_difficulty: string;
          topics: string[];
          languages: string[];
          content_type: "external_link" | "original_content" | "licensed_import";
          learning_objective: string;
          summary: string;
          hints: string[];
          approach_outline: string;
          complexity_time: string;
          complexity_space: string;
          attribution: string;
          metadata_provenance: string;
          related_course_id: string | null;
          curated_order: number;
          published: boolean;
          last_verified_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          slug: string;
          source: "LeetCode" | "Codeforces" | "HackerRank" | "BUCKLABS Original";
          canonical_url: string;
          difficulty: "Beginner" | "Easy" | "Medium" | "Hard";
          external_difficulty: string;
          topics?: string[];
          languages?: string[];
          content_type?: "external_link" | "original_content" | "licensed_import";
          learning_objective: string;
          summary: string;
          hints?: string[];
          approach_outline: string;
          complexity_time: string;
          complexity_space: string;
          attribution: string;
          metadata_provenance: string;
          related_course_id?: string | null;
          curated_order?: number;
          published?: boolean;
          last_verified_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          source?: "LeetCode" | "Codeforces" | "HackerRank" | "BUCKLABS Original";
          canonical_url?: string;
          difficulty?: "Beginner" | "Easy" | "Medium" | "Hard";
          external_difficulty?: string;
          topics?: string[];
          languages?: string[];
          content_type?: "external_link" | "original_content" | "licensed_import";
          learning_objective?: string;
          summary?: string;
          hints?: string[];
          approach_outline?: string;
          complexity_time?: string;
          complexity_space?: string;
          attribution?: string;
          metadata_provenance?: string;
          related_course_id?: string | null;
          curated_order?: number;
          published?: boolean;
          last_verified_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      problem_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          problem_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      practice_attempts: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          status: "not_started" | "in_progress" | "solved" | "needs_revision";
          verification_type: "user_reported" | "verified_integration";
          preferred_language: string | null;
          notes: string;
          first_attempted_at: string;
          last_attempted_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_id: string;
          status?: "not_started" | "in_progress" | "solved" | "needs_revision";
          verification_type?: "user_reported" | "verified_integration";
          preferred_language?: string | null;
          notes?: string;
          first_attempted_at?: string;
          last_attempted_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          problem_id?: string;
          status?: "not_started" | "in_progress" | "solved" | "needs_revision";
          verification_type?: "user_reported" | "verified_integration";
          preferred_language?: string | null;
          notes?: string;
          first_attempted_at?: string;
          last_attempted_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_type:
            | "course_enrolled"
            | "module_completed"
            | "course_completed"
            | "problem_status_updated"
            | "problem_bookmarked"
            | "onboarding_completed"
            | "ai_tutor_used"
            | "career_assessment_completed";
          resource_type: "course" | "learning_path" | "problem" | "profile" | "ai_tutor" | "career";
          resource_id: string;
          resource_title: string;
          occurred_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type:
            | "course_enrolled"
            | "module_completed"
            | "course_completed"
            | "problem_status_updated"
            | "problem_bookmarked"
            | "onboarding_completed"
            | "ai_tutor_used"
            | "career_assessment_completed";
          resource_type: "course" | "learning_path" | "problem" | "profile" | "ai_tutor" | "career";
          resource_id: string;
          resource_title: string;
          occurred_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?:
            | "course_enrolled"
            | "module_completed"
            | "course_completed"
            | "problem_status_updated"
            | "problem_bookmarked"
            | "onboarding_completed"
            | "ai_tutor_used"
            | "career_assessment_completed";
          resource_type?:
            | "course"
            | "learning_path"
            | "problem"
            | "profile"
            | "ai_tutor"
            | "career";
          resource_id?: string;
          resource_title?: string;
          occurred_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          topic: string;
          message: string;
          status: "received" | "reviewed" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          topic?: string;
          message: string;
          status?: "received" | "reviewed" | "resolved";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          topic?: string;
          message?: string;
          status?: "received" | "reviewed" | "resolved";
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscriptions: {
        Row: {
          id: string;
          email: string;
          status: "subscribed" | "unsubscribed";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          status?: "subscribed" | "unsubscribed";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          status?: "subscribed" | "unsubscribed";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
