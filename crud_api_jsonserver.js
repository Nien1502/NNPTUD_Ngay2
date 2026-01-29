// Phiên bản code này sử dụng json-server API chuẩn cho toàn bộ thao tác CRUD với posts và comments
let allPosts = [];
let allComments = [];
let filteredPosts = [];
let currentSort = null;

// Helper: fetch posts/comments từ API
async function loadData() {
    try {
        const [postsRes, commentsRes] = await Promise.all([
            fetch('http://localhost:3000/posts'),
            fetch('http://localhost:3000/comments')
        ]);
        allPosts = await postsRes.json();
        allComments = await commentsRes.json();
        filteredPosts = [...allPosts];
        renderPosts(filteredPosts);
    } catch (error) {
        document.getElementById('products-container').innerHTML =
            '<tr><td colspan="7" class="text-center text-danger">Failed to load posts.</td></tr>';
    }
}

// Helper: get max id (as number) from array, return string id
function getNextId(arr) {
    let maxId = arr.reduce((max, item) => {
        let idNum = parseInt(item.id, 10);
        return (!isNaN(idNum) && idNum > max) ? idNum : max;
    }, 0);
    return String(maxId + 1);
}

// Render posts with soft-delete and comments
function renderPosts(posts) {
    const container = document.getElementById('products-container');
    if (!posts || posts.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Không tìm thấy post nào.</td></tr>';
        return;
    }
    container.innerHTML = posts.map((post, idx) => {
        const isDeleted = post.isDeleted;
        const postTitle = isDeleted ? `<s>${post.title}</s>` : post.title;
        const postViews = isDeleted ? `<s>${post.views}</s>` : post.views;
        const commentList = allComments
            .filter(c => c.postId === post.id)
            .map(c => `
                <li>
                    <span${c.isDeleted ? ' style="text-decoration:line-through;color:#888;"' : ''}>${c.text}</span>
                    <button class="btn btn-sm btn-danger ms-2" onclick="deleteComment('${c.id}')">Xoá</button>
                    <button class="btn btn-sm btn-secondary ms-1" onclick="editCommentPrompt('${c.id}')">Sửa</button>
                </li>
            `).join('');
        return `
        <tr${isDeleted ? ' class="table-secondary"' : ''}>
            <td>${post.id}</td>
            <td></td>
            <td>${postTitle}</td>
            <td></td>
            <td></td>
            <td>
                <div>Lượt xem: ${postViews}</div>
                <div>
                    <button class="btn btn-sm btn-warning" onclick="softDeletePost('${post.id}')">${isDeleted ? 'Khôi phục' : 'Xoà mềm'}</button>
                    <button class="btn btn-sm btn-danger" onclick="hardDeletePost('${post.id}')">Xoá cứng</button>
                    <button class="btn btn-sm btn-primary" onclick="editPostPrompt('${post.id}')">Sửa</button>
                </div>
                <div class="mt-2">
                    <b>Bình luận:</b>
                    <ul>${commentList || '<li><i>Không có bình luận</i></li>'}</ul>
                    <input type="text" id="comment-input-${post.id}" class="form-control form-control-sm d-inline-block" style="width:70%;" placeholder="Thêm bình luận...">
                    <button class="btn btn-sm btn-success" onclick="addComment('${post.id}')">Thêm</button>
                </div>
            </td>
            <td></td>
        </tr>
        `;
    }).join('');
}

// Search/filter posts by title
function onChanged() {
    const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
    filteredPosts = allPosts.filter(p =>
        p.title.toLowerCase().includes(searchValue)
    );
    applySort();
    renderPosts(filteredPosts);
}

// Sort posts
function sortBy(type) {
    currentSort = type;
    applySort();
    renderPosts(filteredPosts);
}
function applySort() {
    if (!currentSort) return;
    if (currentSort === 'nameAsc') {
        filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'nameDesc') {
        filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (currentSort === 'priceDesc') {
        filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
}

// Soft delete/restore post
async function softDeletePost(id) {
    const post = allPosts.find(p => p.id === id);
    if (post) {
        await fetch(`http://localhost:3000/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: !post.isDeleted })
        });
        await loadData();
    }
}

// Hard delete post (remove from API)
async function hardDeletePost(id) {
    if (!confirm('Xoá cứng post này?')) return;
    await fetch(`http://localhost:3000/posts/${id}`, { method: 'DELETE' });
    // Xoá luôn comments liên quan
    const relatedComments = allComments.filter(c => c.postId === id);
    for (const c of relatedComments) {
        await fetch(`http://localhost:3000/comments/${c.id}`, { method: 'DELETE' });
    }
    await loadData();
}

// Add new post
async function addPostPrompt() {
    const title = prompt('Nhập tiêu đề post:');
    if (!title) return;
    const views = parseInt(prompt('Nhập số lượt xem:', '0'), 10) || 0;
    const newId = getNextId(allPosts);
    const newPost = { id: newId, title, views };
    await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
    });
    await loadData();
}

// Edit post
async function editPostPrompt(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;
    const title = prompt('Sửa tiêu đề:', post.title);
    if (title === null) return;
    const views = parseInt(prompt('Sửa lượt xem:', post.views), 10) || 0;
    await fetch(`http://localhost:3000/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, views })
    });
    await loadData();
}

// CRUD for comments
async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    if (!text) return;
    const newId = getNextId(allComments);
    await fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newId, text, postId })
    });
    input.value = '';
    await loadData();
}
async function deleteComment(id) {
    const cmt = allComments.find(c => c.id === id);
    if (cmt) {
        await fetch(`http://localhost:3000/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: !cmt.isDeleted })
        });
        await loadData();
    }
}
async function editCommentPrompt(id) {
    const cmt = allComments.find(c => c.id === id);
    if (!cmt) return;
    const text = prompt('Sửa bình luận:', cmt.text);
    if (text === null) return;
    await fetch(`http://localhost:3000/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    await loadData();
}

// On page load
window.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Add button for add post
    const btn = document.createElement('button');
    btn.className = 'btn btn-success mb-3';
    btn.innerText = 'Thêm Post';
    btn.onclick = addPostPrompt;
    document.querySelector('.container').insertBefore(btn, document.querySelector('.table-responsive'));
});

// Expose functions
document.onChanged = onChanged;
document.sortBy = sortBy;
document.softDeletePost = softDeletePost;
document.hardDeletePost = hardDeletePost;
document.addPostPrompt = addPostPrompt;
document.editPostPrompt = editPostPrompt;
document.addComment = addComment;
document.deleteComment = deleteComment;
document.editCommentPrompt = editCommentPrompt;
