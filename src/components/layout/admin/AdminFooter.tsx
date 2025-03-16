const AdminFooter = () => {
  return (
    <footer className="border-t py-4 bg-white">
      <div className="container mx-auto">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Hệ thống quản lý đề tài nghiên cứu khoa học và công nghệ - Đại học Sư phạm kỹ thuật - Đại học Đà Nẵng.
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;
