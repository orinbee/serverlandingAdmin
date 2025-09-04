// Dán cấu hình Firebase của bạn vào đây
const firebaseConfig = {
  apiKey: "AIzaSyCxMqYvibF01ky9faJIFb_msg-MaVvYDcI",
  authDomain: "mindxlogin.firebaseapp.com",
  databaseURL: "https://mindxlogin-default-rtdb.firebaseio.com",
  projectId: "mindxlogin",
  storageBucket: "mindxlogin.firebasestorage.app",
  messagingSenderId: "221345458489",
  appId: "1:221345458489:web:c70f1ef85a3cf2ad6260e8"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Lấy các đối tượng DOM
const tableBody = document.getElementById('registrationsTableBody');
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');

let allRegistrations = []; // Biến để lưu trữ toàn bộ dữ liệu cho việc xuất file

// --- Các trạng thái và màu sắc tương ứng ---
const STATUSES = {
    'Mới': 'bg-blue-500 text-white',
    'Tiếp nhận': 'bg-yellow-500 text-white',
    'Đã xong': 'bg-green-500 text-white',
    'Hủy': 'bg-red-500 text-white',
};
const STATUS_OPTIONS = ['Mới', 'Tiếp nhận', 'Đã xong', 'Hủy'];

// Hàm trợ giúp để tạo badge trạng thái
function getStatusBadge(status) {
    const badgeClass = STATUSES[status] || 'bg-gray-400 text-white';
    return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}">${status}</span>`;
}

// --- Hiển thị dữ liệu đăng ký ---
const registrationsRef = database.ref('registrations');
registrationsRef.on('value', (snapshot) => {
    tableBody.innerHTML = '';
    allRegistrations = [];
    const data = snapshot.val();
    if (data) {
        let index = 1;
        Object.keys(data).forEach(key => {
            const reg = data[key];
            reg.key = key; // Lưu lại key của Firebase để dễ dàng thao tác

            // Gán trạng thái mặc định là "Mới" nếu chưa có
            if (!reg.status) {
                reg.status = 'Mới';
            }
            
            allRegistrations.push(reg);

            const timestamp = new Date(reg.timestamp).toLocaleString('vi-VN');

            // Tạo dropdown cho việc thay đổi trạng thái
            const statusDropdown = `
                <select class="status-select" data-key="${key}">
                    ${STATUS_OPTIONS.map(opt => `<option value="${opt}" ${reg.status === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            `;
            
            const row = `
                <tr>
                    <td>${index}</td>
                    <td>${reg.productName}</td>
                    <td>${reg.name}</td>
                    <td>${reg.phone}</td>
                    <td>${reg.type}</td>
                    <td>${reg.notes}</td>
                    <td>${timestamp}</td>
                    <td>${getStatusBadge(reg.status)}</td>
                    <td>
                        ${statusDropdown}
                        <button class="action-btn delete-btn" data-key="${key}">Xóa</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
            index++;
        });
    } else {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Chưa có lượt đăng ký nào.</td></tr>';
    }
});

// --- Xử lý sự kiện cho các nút hành động (Xóa, đổi Trạng thái) ---
tableBody.addEventListener('click', (event) => {
    const target = event.target;

    // Kiểm tra nếu người dùng nhấn nút Xóa
    if (target.classList.contains('delete-btn')) {
        const key = target.dataset.key;
        if (confirm('Bạn có chắc chắn muốn xóa lượt đăng ký này?')) {
            deleteRegistration(key);
        }
    }
});

tableBody.addEventListener('change', (event) => {
    const target = event.target;

    // Kiểm tra nếu người dùng thay đổi trạng thái
    if (target.classList.contains('status-select')) {
        const key = target.dataset.key;
        const newStatus = target.value;
        updateStatus(key, newStatus);
    }
});

// Hàm cập nhật trạng thái trên Firebase
function updateStatus(key, newStatus) {
    database.ref('registrations/' + key).update({
        status: newStatus
    }).then(() => {
        console.log(`Cập nhật trạng thái thành công cho key: ${key}`);
    }).catch(error => {
        console.error("Lỗi khi cập nhật trạng thái: ", error);
        alert("Có lỗi xảy ra, không thể cập nhật trạng thái!");
    });
}

// Hàm xóa đăng ký trên Firebase
function deleteRegistration(key) {
    database.ref('registrations/' + key).remove()
    .then(() => {
        console.log(`Xóa thành công lượt đăng ký có key: ${key}`);
    }).catch(error => {
        console.error("Lỗi khi xóa: ", error);
        alert("Có lỗi xảy ra, không thể xóa lượt đăng ký!");
    });
}


// --- Chức năng tìm kiếm (Không thay đổi) ---
searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = tableBody.getElementsByTagName('tr');

    for (let row of rows) {
        // Bỏ qua cột hành động khi tìm kiếm để tránh sai sót
        const cells = Array.from(row.getElementsByTagName('td')).slice(0, -1); 
        const rowText = cells.map(cell => cell.textContent).join(' ').toLowerCase();
        
        if (rowText.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
});


// --- Chức năng Xuất ra Excel (Cập nhật để thêm cột Trạng thái) ---
exportBtn.addEventListener('click', () => {
    if (allRegistrations.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    const dataToExport = allRegistrations.map((reg, index) => ({
        'STT': index + 1,
        'Tên Sản Phẩm': reg.productName,
        'Người Đăng Ký': reg.name,
        'Số Điện Thoại': reg.phone,
        'Thể Loại': reg.type,
        'Trạng Thái': reg.status, // Thêm cột trạng thái vào file Excel
        'Ghi Chú': reg.notes,
        'Thời Gian': new Date(reg.timestamp).toLocaleString('vi-VN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDangKy");
    XLSX.writeFile(workbook, "DanhSachDangKy.xlsx");
});