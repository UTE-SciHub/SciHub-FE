const UserFooter = () => {
  return (
    <footer className="border-t py-8 bg-[#3782F5] text-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">UTE-SciHub</h3>
            <p className="text-sm">
              Hệ thống quản lý đề tài nghiên cứu khoa học và công nghệ - Đại học Sư phạm kỹ thuật - Đại học Đà Nẵng.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className=""
                >
                  Trang chủ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className=""
                >
                  Đăng ký đề tài
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className=""
                >
                  Tra cứu đề tài
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className=""
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
                  className=""
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className=""
                >
                  Liên hệ hỗ trợ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className=""
                >
                  Báo lỗi hệ thống
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li className="">
                Phòng Quản lý Khoa học và Công nghệ
              </li>
              <li className="">
                Trường Đại học Sư phạm Kỹ thuật Đà Nẵng
              </li>
              <li className="">
                Email: qlkh@ute.udn.vn
              </li>
              <li className="">Tel: (028) 3896 xxxx</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm ">
          <p>
            &copy; {new Date().getFullYear()} UTE-SciHub. Đại học Sư phạm Kỹ
            thuật Đà Nẵng.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
