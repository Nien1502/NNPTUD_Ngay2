
// Load posts and comments
async function Load() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let data = await res.json();
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        for (const post of data) {
            if (post.isDeleted) {
                body.innerHTML += `
                <tr style="color:gray;">
                    <td><s>${post.id}</s></td>
                    <td><s>${post.title}</s></td>
                    <td><s>${post.views}</s></td>
                    <td><s>Đã xoá</s></td>
                </tr>`
            } else {
                body.innerHTML += `
                <tr>
                    <td>${post.id}</td>
                    <td>${post.title}</td>
                    <td>${post.views}</td>
                    <td><input value="Delete" type="submit" onclick="Delete('${post.id}')" /></td>
                </tr>`
            }
        }
        LoadComments();
    } catch (error) {}
}

// Save or update post
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;
    let res;
    if (id) {
        // Update
        res = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title, views: views })
        });
    } else {
        // Create mới, tự động sinh id dạng chuỗi
        let resAll = await fetch('http://localhost:3000/posts');
        let allPosts = await resAll.json();
        let maxId = 0;
        for (const p of allPosts) {
            let pid = parseInt(p.id);
            if (!isNaN(pid) && pid > maxId) maxId = pid;
        }
        let newId = (maxId + 1).toString();
        res = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: newId, title: title, views: views })
        });
    }
    if (res.ok) {
        console.log("them/cap nhat thanh cong");
        Load();
    }
}

// Soft delete post
async function Delete(id) {
    // Xoá mềm: cập nhật isDeleted:true
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ isDeleted: true })
    });
    if (res.ok) {
        console.log("xóa thành công");
        Load();
    }
}

// CRUD cho comments
async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let data = await res.json();
        let body = document.getElementById("comments-body");
        if (!body) return;
        body.innerHTML = "";
        for (const c of data) {
            body.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.text}</td>
                <td>${c.postId}</td>
                <td>
                    <input type="button" value="Edit" onclick="EditComment('${c.id}','${c.text}','${c.postId}')" />
                    <input type="button" value="Delete" onclick="DeleteComment('${c.id}')" />
                </td>
            </tr>`;
        }
    } catch (e) {}
}

async function SaveComment() {
    let id = document.getElementById("cid_txt").value;
    let text = document.getElementById("ctext_txt").value;
    let postId = document.getElementById("cpostid_txt").value;
    let res;
    if (id) {
        res = await fetch('http://localhost:3000/comments/' + id, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, postId })
        });
    } else {
        let resAll = await fetch('http://localhost:3000/comments');
        let all = await resAll.json();
        let maxId = 0;
        for (const c of all) {
            let cid = parseInt(c.id);
            if (!isNaN(cid) && cid > maxId) maxId = cid;
        }
        let newId = (maxId + 1).toString();
        res = await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newId, text, postId })
        });
    }
    if (res.ok) {
        console.log("comment them/cap nhat thanh cong");
        LoadComments();
    }
}

async function DeleteComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id, { method: 'DELETE' });
    if (res.ok) {
        console.log("comment xóa thành công");
        LoadComments();
    }
}

function EditComment(id, text, postId) {
    document.getElementById("cid_txt").value = id;
    document.getElementById("ctext_txt").value = text;
    document.getElementById("cpostid_txt").value = postId;
}

window.onload = function() {
    Load();
    LoadComments();
}
Load();
