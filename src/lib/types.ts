export type UserRole = "worker" | "client";

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    phone: string;
    avatar_url: string | null;
    lat: number | null;
    lng: number | null;
    is_available: boolean;
    rating_avg: number;
    rating_count: number;
    created_at: string;
    updated_at: string;
}

export type JobCategory = "electrical" | "plumbing" | "cleaning" | "delivery" | "carpenter" | "general";
export type JobStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface Job {
    id: string;
    client_id: string;
    title: string;
    description: string;
    pay: string;
    category: JobCategory;
    lat: number;
    lng: number;
    status: JobStatus;
    created_at: string;
    updated_at: string;
    // Joined
    client?: Profile;
    distance?: number;
}

export type RequestStatus = "pending" | "accepted" | "rejected";

export interface JobRequest {
    id: string;
    job_id: string;
    worker_id: string;
    message: string;
    status: RequestStatus;
    created_at: string;
    updated_at: string;
    // Joined
    worker?: Profile;
    job?: Job;
}

export interface Message {
    id: string;
    request_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export interface Rating {
    id: string;
    job_id: string;
    rater_id: string;
    rated_id: string;
    score: number;
    comment: string;
    created_at: string;
}
