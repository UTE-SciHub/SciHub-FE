const UserFooter = () => {
  return (
    <footer className="border-t py-8 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">UTE-SciHub</h3>
            <p className="text-sm text-muted-foreground">
              Hệ thống quản lý đề tài nghiên cứu khoa học và công nghệ - Đại học Sư phạm kỹ thuật - Đại học Đà Nẵng.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Trang chủ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Đăng ký đề tài
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tra cứu đề tài
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Hướng dẫn sử dụng
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Liên hệ hỗ trợ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Báo lỗi hệ thống
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">
                Phòng Quản lý Khoa học và Công nghệ
              </li>
              <li className="text-muted-foreground">
                Trường Đại học Sư phạm Kỹ thuật
              </li>
              <li className="text-muted-foreground">
                Email: qlkh@hcmute.edu.vn
              </li>
              <li className="text-muted-foreground">Tel: (028) 3896 xxxx</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} UTE-SciHub. Đại học Sư phạm Kỹ
            thuật TP.HCM.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
