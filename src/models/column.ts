export interface Column {
    key: string;
    title: string;
    width?: string;
    render?: (value: any, record: any, index: number) => React.ReactNode;
    align?: "left" | "center" | "right";
    sortable?: boolean;
}