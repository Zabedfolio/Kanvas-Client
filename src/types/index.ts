export interface Tag {
    id: number;
    name: string;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    due_date: string | null; // Format: "YYYY-MM-DD"
    tags: Tag[];
    created_at: string;
    updated_at: string;
}

export interface AnnotationImage {
    id: number;
    url: string; // The URL to display (ImgBB or local fallback)
    image: string | null;
    image_url: string | null;
    uploaded_at: string;
}

export interface Point {
    x: number;
    y: number;
}

export interface Polygon {
    id: number;
    image: number;
    points: Point[];
    label: string;
    created_at: string;
}

export interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}
