// script.js
let teachersData = [];

async function loadData() {
    try {
        const res = await fetch('teachers.json');
        teachersData = await res.json();
        populateTeacherList();
    } catch (err) {
        console.error('Failed to load data:', err);
    }
}

function populateTeacherList() {
    const dataList = document.getElementById("teachersList");
    teachersData.forEach(t => {
        const option = document.createElement("option");
        option.value = t.name;
        dataList.appendChild(option);
    });
}

function getCurrentPeriod() {
    const now = new Date();
    const minutesSince8 = (now.getHours() * 60 + now.getMinutes()) - 480;

    if (minutesSince8 < 0 || minutesSince8 > 340) return null;
    if (minutesSince8 >= 160 && minutesSince8 < 180) return { period: "Recess", index: 4 };

    const index = minutesSince8 < 160 ? Math.floor(minutesSince8 / 40) : Math.floor((minutesSince8 - 20) / 40);
    return { period: `Period ${index + 1}`, index };
}

function searchTeacher(name) {
    const teacher = teachersData.find(t => t.name.toLowerCase().includes(name.toLowerCase()));
    const resultDiv = document.getElementById("currentClass");
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    if (!teacher) {
        resultDiv.innerHTML = `<p>No such teacher found.</p>`;
        document.getElementById("customPeriodSelect").style.display = "none";
        return;
    }

    const timing = getCurrentPeriod();
    if (!timing) {
        resultDiv.innerHTML = `<p><strong>${teacher.name}</strong> is at home.<br>It’s currently outside school hours.</p>`;
        displayFullTimetable(teacher);
        return;
    }

    const subject = teacher.timetable[today]?.[timing.index] || "Free";
    resultDiv.innerHTML = `<p><strong>${teacher.name}</strong> is currently in <strong>${subject}</strong> during <strong>${timing.period}</strong>.</p>`;
    displayFullTimetable(teacher);
}

function displayFullTimetable(teacher) {
    const table = document.getElementById("timetableBody");
    table.innerHTML = "";
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    table.innerHTML = "";

    days.forEach(day => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = `${day}`;
        row.appendChild(nameCell);

        const periods = teacher.timetable[day] || [];
        for (let i = 0; i < 8; i++) {
            const cell = document.createElement("td");
            cell.textContent = periods[i] || "Free";
            row.appendChild(cell);
        }

        table.appendChild(row);
    });
}

// Event Listeners
loadData();
document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("teacherName").value.trim();
    if (name) searchTeacher(name);
});