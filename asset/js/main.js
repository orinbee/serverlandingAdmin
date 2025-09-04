// Khởi tạo Firebase
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
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const productImageUrlInput = document.getElementById('productImageUrl');
const productTitleInput = document.getElementById('productTitle');
const productDescInput = document.getElementById('productDesc');
const productFieldsInput = document.getElementById('productFields');
const productStatusInput = document.getElementById('productStatus');
const productListDiv = document.getElementById('productList');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');


// Hàm để reset form về trạng thái ban đầu (thêm mới)
const resetForm = () => {
    productForm.reset(); // Xóa tất cả giá trị trong form
    productIdInput.value = ''; // Quan trọng: xóa ID sản phẩm đang sửa
    formTitle.innerText = 'Thêm Sản Phẩm Mới';
    cancelBtn.classList.add('hidden'); // Ẩn nút Hủy
}

// === Xử lý sự kiện submit form (Thêm mới hoặc Cập nhật) ===
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const productId = productIdInput.value;

    const productData = {
        title: productTitleInput.value,
        description: productDescInput.value,
        fields: productFieldsInput.value.split(',').map(field => field.trim()),
        status: productStatusInput.value,
        imageUrl: productImageUrlInput.value
    };

    if (productId) {
        // --- Chế độ CẬP NHẬT (vì có productId) ---
        database.ref('products/' + productId).update(productData)
            .then(() => {
                alert('Cập nhật sản phẩm thành công!');
                resetForm();
            })
            .catch(error => {
                console.error("Lỗi khi cập nhật:", error);
                alert("Cập nhật sản phẩm thất bại!");
            });
    } else {
        // --- Chế độ THÊM MỚI (vì không có productId) ---
        database.ref('products').push(productData)
            .then(() => {
                alert('Thêm sản phẩm thành công!');
                resetForm();
            })
            .catch(error => {
                console.error("Lỗi khi thêm mới:", error);
                alert("Thêm sản phẩm thất bại!");
            });
    }
});


// === Hiển thị danh sách sản phẩm ===
const productsRef = database.ref('products');
productsRef.on('value', (snapshot) => {
    productListDiv.innerHTML = '';
    const data = snapshot.val();
    if (data) {
        Object.keys(data).forEach(key => {
            const product = data[key];
            const productCard = `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/280x150?text=Invalid+Image';">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <div class="tags">
                        ${product.fields.map(field => `<span>${field}</span>`).join('')}
                    </div>
                    <div class="status ${product.status}">${product.status === 'public' ? 'Còn Hàng' : 'Đã hết'}</div>
                    <div class="actions">
                        <!-- NÚT SỬA MỚI -->
                        <button class="edit-btn" data-key="${key}">Sửa</button>
                        <button class="delete-btn" data-key="${key}">Xóa</button>
                    </div>
                </div>
            `;
            productListDiv.innerHTML += productCard;
        });
    } else {
        productListDiv.innerHTML = '<p>Chưa có sản phẩm nào.</p>';
    }
});


// === Xử lý các sự kiện click trên danh sách sản phẩm (Sửa và Xóa) ===
productListDiv.addEventListener('click', (e) => {
    const target = e.target;
    const productKey = target.getAttribute('data-key');

    // Nếu nhấn nút SỬA
    if (target.classList.contains('edit-btn')) {
        const productRef = database.ref('products/' + productKey);
        productRef.once('value').then(snapshot => {
            const product = snapshot.val();
            // Đổ dữ liệu sản phẩm lên form
            productIdInput.value = productKey; // Quan trọng: set ID để form biết là đang sửa
            productImageUrlInput.value = product.imageUrl;
            productTitleInput.value = product.title;
            productDescInput.value = product.description;
            productFieldsInput.value = product.fields.join(', '); // Chuyển mảng thành chuỗi
            productStatusInput.value = product.status;

            // Chuyển UI sang chế độ sửa
            formTitle.innerText = 'Chỉnh Sửa Sản Phẩm';
            cancelBtn.classList.remove('hidden'); // Hiện nút Hủy
            window.scrollTo(0, 0); // Cuộn lên đầu trang để thấy form
        });
    }

    // Nếu nhấn nút XÓA
    if (target.classList.contains('delete-btn')) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            database.ref('products/' + productKey).remove()
                .then(() => alert('Sản phẩm đã được xóa!'))
                .catch(error => console.error("Lỗi khi xóa:", error));
        }
    }
});

// === Xử lý sự kiện click nút Hủy ===
cancelBtn.addEventListener('click', () => {
    resetForm();
});