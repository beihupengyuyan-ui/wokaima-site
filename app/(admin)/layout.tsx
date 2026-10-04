import AdminEscapeBack from "@/components/AdminEscapeBack";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="animate-fade-in">
            <AdminEscapeBack />
            {children}
        </div>
    );
}