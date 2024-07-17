//Khi người dùng nhập file excel thì gọi hàm đọc dữ liệu file excel
document.getElementById('upload').addEventListener('change', handleFile, false); 

function handleFile(event) {
    const file = event.target.files[0]; // Lấy tệp đầu tiên từ danh sách tệp mà người dùng đã tải lên.
    const reader = new FileReader(); //Tạo một đối tượng FileReader để đọc nội dung của tệp.
    
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result); //Tạo một mảng Uint8Array
        const workbook = XLSX.read(data, {type: 'array'}); //Sử dụng thư viện XLSX để đọc dữ liệu từ mảng Uint8Array và tạo ra một đối tượng workbook. Tham số {type: 'array'} cho biết rằng dữ liệu được cung cấp dưới dạng một mảng.
        const sheetName = workbook.SheetNames[0]; //Lấy tên của sheet đầu tiên trong workbook
        const sheet = workbook.Sheets[sheetName]; //Lấy đối tượng sheet đầu tiên từ workbook bằng tên của nó.
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); //Chuyển đổi sheet thành định dạng JSON
        
        const matrix = jsonData.map(row => row.map(Number)); //Chuyển đổi từng giá trị trong JSON thành số bằng cách sử dụng hàm map
        displayMatrix(matrix);
        drawGraph(matrix); // Gọi hàm drawGraph và truyền ma trận vừa tạo để vẽ đồ thị.
    };
    console.log(file)
    reader.readAsArrayBuffer(file); // Bắt đầu đọc tệp dưới dạng một ArrayBuffer. Khi quá trình đọc hoàn tất, hàm onload sẽ được gọi với kết quả đọc được.
}

function displayMatrix(matrix) {
    const container = document.getElementById('matrix-container');
    container.innerHTML = ''; // Xóa nội dung cũ
    
    const table = document.createElement('table');
    matrix.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
    container.appendChild(table);
}

function bfsColoring(matrix) {
    const colors = new Array(matrix.length).fill(-1); // -1 nghĩa là chưa có màu
    colors[0] = 0; // Gán màu đầu tiên cho đỉnh đầu tiên

    const queue = [0]; // Hàng đợi cho BFS

    while (queue.length > 0) {
        const u = queue.shift();

        // Đánh dấu các màu của đỉnh kề là đã sử dụng
        const availableColors = new Array(matrix.length).fill(true);
        for (let neighbor = 0; neighbor < matrix.length; neighbor++) {
            if (matrix[u][neighbor] === 1 && colors[neighbor] !== -1) {
                availableColors[colors[neighbor]] = false;
            }
        }

        // Tìm màu đầu tiên chưa được sử dụng
        let color;
        for (color = 0; color < availableColors.length; color++) {
            if (availableColors[color]) {
                break;
            }
        }

        // Gán màu tìm được cho đỉnh u
        colors[u] = color;

        // Đẩy các đỉnh kề chưa được tô màu vào hàng đợi
        for (let neighbor = 0; neighbor < matrix.length; neighbor++) {
            if (matrix[u][neighbor] === 1 && colors[neighbor] === -1) {
                queue.push(neighbor);
            }
        }
    }
    return colors;
}

function drawGraph(matrix) {
    // Tô màu đồ thị
    const colors = bfsColoring(matrix);

    // Tạo dữ liệu cho vis.js
    const nodes = [];
    const edges = [];

    for (let i = 0; i < matrix.length; i++) {
        nodes.push({ id: i, label: `Node ${i}`, color: `hsl(${colors[i] * 60}, 100%, 75%)` });
        for (let j = 0; j < matrix.length; j++) {
            if (matrix[i][j] === 1 && i < j) {
                edges.push({ from: i, to: j });
            }
        }
    }

    // Tạo đồ thị
    const container = document.getElementById('mynetwork');
    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
    const options = {};
    const network = new vis.Network(container, data, options);
}