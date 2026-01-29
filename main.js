function sortByName(order) {
  currentData = [...currentData].sort((a, b) => {
    if (order === 'asc') return a.title.localeCompare(b.title);
    else return b.title.localeCompare(a.title);
  });
  renderData(currentData);
}
// main.js

let allData = [];
let currentData = [];
fetch('db.json')
  .then(response => response.json())
  .then(data => {
    allData = data;
    currentData = [...allData];
    renderData(currentData);
  })
  .catch(() => {
    document.getElementById('data-container').textContent = 'Không thể tải dữ liệu từ db.json!';
  });

function onSearchChanged() {
  const value = document.getElementById('searchInput').value.toLowerCase();
  currentData = allData.filter(item => item.title.toLowerCase().includes(value));
  renderData(currentData);
}

function sortByPrice(order) {
  currentData = [...currentData].sort((a, b) => {
    if (order === 'asc') return a.price - b.price;
    else return b.price - a.price;
  });
  renderData(currentData);
}

function renderData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    document.getElementById('data-container').innerHTML = '<div class="alert alert-warning">Không có dữ liệu.</div>';
    return;
  }
  let html = '<table class="table table-bordered table-hover align-middle rounded-3 overflow-hidden">'
    + '<thead class="table-primary text-center"><tr>'
    + '<th style="width:60px">ID</th>'
    + '<th style="min-width:180px">Tên sản phẩm</th>'
    + '<th style="width:100px">Giá</th>'
    + '<th style="min-width:220px">Mô tả</th>'
    + '<th style="min-width:120px">Danh mục</th>'
    + '<th style="width:120px">Hình ảnh</th>'
    + '<th style="width:120px">Thao tác</th>'
    + '</tr></thead><tbody>';
  html += data.map(item =>
    `<tr>
      <td class="text-center fw-bold">${item.id}</td>
      <td>${item.title}</td>
      <td class="text-end text-primary fw-semibold">${item.price.toLocaleString()}$</td>
      <td>${item.description}</td>
      <td>${item.category?.name || ''}</td>
      <td class="text-center"><img src="${item.images?.[0] || ''}" alt="image" class="rounded shadow-sm border" style="max-width:70px;max-height:70px;object-fit:cover"></td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${item.id})">Sửa</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">Xóa</button>
      </td>
    </tr>`
  ).join('');
  html += '</tbody></table>';
  document.getElementById('data-container').innerHTML = html;
}

// Xóa sản phẩm
function deleteItem(id) {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    allData = allData.filter(item => item.id !== id);
    currentData = currentData.filter(item => item.id !== id);
    renderData(currentData);
  }
}

// Mở modal sửa
function openEditModal(id) {
  const item = allData.find(i => i.id === id);
  if (!item) return;
  document.getElementById('editId').value = item.id;
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editDescription').value = item.description;
  document.getElementById('editCategory').value = item.category?.name || '';
  document.getElementById('editImage').value = item.images?.[0] || '';
  const modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

// Lưu chỉnh sửa
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('editForm');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const id = Number(document.getElementById('editId').value);
      const title = document.getElementById('editTitle').value;
      const price = Number(document.getElementById('editPrice').value);
      const description = document.getElementById('editDescription').value;
      const category = document.getElementById('editCategory').value;
      const image = document.getElementById('editImage').value;
      // Cập nhật dữ liệu
      allData = allData.map(item =>
        item.id === id ? {
          ...item,
          title,
          price,
          description,
          category: { ...item.category, name: category },
          images: [image]
        } : item
      );
      currentData = currentData.map(item =>
        item.id === id ? {
          ...item,
          title,
          price,
          description,
          category: { ...item.category, name: category },
          images: [image]
        } : item
      );
      renderData(currentData);
      bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    };
  }
});
