// Основной объект для хранения данных
let summerData = {
    events: {},
    participants: [],
    settings: {
        startDate: '2026-06-01',
        endDate: '2026-08-31'
    }
};

// Элементы DOM
const calendarEl = document.getElementById('calendar');
const currentMonthEl = document.getElementById('currentMonth');
const eventModal = document.getElementById('eventModal');
const reportModal = document.getElementById('reportModal');
const eventForm = document.getElementById('eventForm');
const monthSelect = document.getElementById('monthSelect');
const yearSelect = document.getElementById('yearSelect');
const dayInfoEl = document.getElementById('dayInfo');
const activitiesListEl = document.getElementById('activitiesList');
const gamesListEl = document.getElementById('gamesListContent');

// Текущая дата
let currentDate = new Date('2026-06-01');
let selectedDate = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initCalendar();
    setupEventListeners();
    updateStats();
});

// Загрузка данных из localStorage
function loadData() {
    const saved = localStorage.getItem('summer2026');
    if (saved) {
        summerData = JSON.parse(saved);
    }
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('summer2026', JSON.stringify(summerData));
    updateStats();
}

// Инициализация календаря
function initCalendar() {
    renderCalendar(currentDate);
    updateCurrentMonth();
}

// Рендер календаря
function renderCalendar(date) {
    calendarEl.innerHTML = '';
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    // День недели первого дня (0 - воскресенье, 1 - понедельник)
    const firstDayWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    // Добавляем пустые клетки для начала месяца
    for (let i = 0; i < firstDayWeekday; i++) {
        const dayEl = createDayElement(null, 'day-other-month');
        calendarEl.appendChild(dayEl);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDay = new Date(year, month, day);
        const dateStr = formatDate(currentDay);
        const event = summerData.events[dateStr];
        
        let dayClass = 'day';
        if (event) {
            dayClass += event.walked ? ' day-walked' : ' day-not-walked';
            dayClass += ' day-has-event';
        }
        
        const dayEl = createDayElement(day, dayClass, dateStr, event);
        calendarEl.appendChild(dayEl);
    }
    
    updateCurrentMonth();
}

// Создание элемента дня
function createDayElement(dayNumber, className, dateStr = null, event = null) {
    const dayEl = document.createElement('div');
    dayEl.className = className;
    
    if (dayNumber !== null) {
        const dayNumberEl = document.createElement('div');
        dayNumberEl.className = 'day-number';
        dayNumberEl.textContent = dayNumber;
        dayEl.appendChild(dayNumberEl);
        
        // Добавляем иконку рейтинга, если есть событие
        if (event && event.rating) {
            const ratingEl = document.createElement('div');
            ratingEl.className = 'day-rating-mini';
            ratingEl.innerHTML = '★'.repeat(event.rating);
            ratingEl.style.color = '#ffd700';
            ratingEl.style.fontSize = '0.8rem';
            dayEl.appendChild(ratingEl);
        }
        
        // Добавляем иконку погоды, если есть
        if (event && event.weather) {
            const weatherIcons = {
                sunny: '☀️',
                cloudy: '⛅',
                'partly-cloudy': '🌤️',
                rainy: '🌧️',
                stormy: '⛈️',
                windy: '🌬️',
                hot: '🔥',
                cool: '🍃'
            };
            
            const weatherEl = document.createElement('div');
            weatherEl.className = 'day-weather';
            weatherEl.textContent = weatherIcons[event.weather] || '🌤️';
            weatherEl.style.fontSize = '1.2rem';
            dayEl.appendChild(weatherEl);
        }
    }
    
    if (dateStr) {
        dayEl.dataset.date = dateStr;
        
        // Один клик - просмотр
        dayEl.addEventListener('click', () => showDayDetails(dateStr));
        
        // Двойной клик - удаление
        dayEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (confirm('Удалить запись за этот день?')) {
                delete summerData.events[dateStr];
                saveData();
                renderCalendar(currentDate);
                showDayDetails(dateStr);
            }
        });
    }
    
    return dayEl;
}

// Показать детали дня
function showDayDetails(dateStr) {
    selectedDate = dateStr;
    const event = summerData.events[dateStr];
    const date = new Date(dateStr);
    
    document.getElementById('selectedDate').textContent = 
        formatDateDisplay(date);
    
    if (event) {
        // Показываем рейтинг
        const ratingStars = '★'.repeat(event.rating) + '☆'.repeat(5 - event.rating);
        document.getElementById('dayRating').innerHTML = ratingStars;
        
        // Формируем информацию о дне
        let infoHTML = `
            <div class="info-item">
                <h4><i class="fas fa-walking"></i> Гуляли:</h4>
                <p>${event.walked ? '✅ Да' : '❌ Нет'}</p>
            </div>
            <div class="info-item">
                <h4><i class="fas fa-users"></i> Кто был:</h4>
                <p>${event.participants || 'Не указано'}</p>
            </div>
            <div class="info-item">
                <h4><i class="fas fa-user-slash"></i> Кого не было:</h4>
                <p>${event.absent || 'Все были'}</p>
            </div>
            <div class="info-item">
                <h4><i class="fas fa-cloud-sun"></i> Погода:</h4>
                <p>${getWeatherDisplay(event.weather)}</p>
            </div>
        `;
        
        if (event.notes) {
            infoHTML += `
                <div class="info-item">
                    <h4><i class="fas fa-sticky-note"></i> Заметки:</h4>
                    <p>${event.notes}</p>
                </div>
            `;
        }
        
        if (event.photo) {
            infoHTML += `
                <div class="info-item">
                    <h4><i class="fas fa-camera"></i> Фото/видео:</h4>
                    <a href="${event.photo}" target="_blank">Ссылка</a>
                </div>
            `;
        }
        
        dayInfoEl.innerHTML = infoHTML;
        
        // Показываем активности
        if (event.activities) {
            const activities = event.activities.split('\n').filter(a => a.trim());
            activitiesListEl.innerHTML = activities.map(a => `<li>${a}</li>`).join('');
        }
        
        // Показываем игры
        if (event.games) {
            const games = event.games.split('\n').filter(g => g.trim());
            gamesListEl.innerHTML = games.map(g => `<li>${g}</li>`).join('');
        }
        
    } else {
        document.getElementById('dayRating').innerHTML = '';
        dayInfoEl.innerHTML = `
            <p class="placeholder">
                <i class="fas fa-calendar-plus"></i><br>
                Нет записи за этот день<br>
                <button class="btn add-event-btn" onclick="openEventModal('${dateStr}')" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Добавить запись
                </button>
            </p>
        `;
        activitiesListEl.innerHTML = '';
        gamesListEl.innerHTML = '';
    }
}

// Открыть модальное окно для добавления/редактирования
function openEventModal(dateStr = null) {
    const form = document.getElementById('eventForm');
    form.reset();
    
    if (dateStr) {
        document.getElementById('eventDate').value = dateStr;
        const event = summerData.events[dateStr];
        
        if (event) {
            // Заполняем форму существующими данными
            document.querySelector(`input[name="walked"][value="${event.walked}"]`).checked = true;
            document.getElementById('rating').value = event.rating;
            document.getElementById('participants').value = event.participants || '';
            document.getElementById('absent').value = event.absent || '';
            document.getElementById('weather').value = event.weather || '';
            document.getElementById('activities').value = event.activities || '';
            document.getElementById('games').value = event.games || '';
            document.getElementById('notes').value = event.notes || '';
            document.getElementById('photo').value = event.photo || '';
            
            // Обновляем звезды рейтинга
            updateStars(event.rating);
        }
    } else {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').value = today;
    }
    
    eventModal.style.display = 'flex';
}

// Сохранение события
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('eventDate').value;
    const walked = document.querySelector('input[name="walked"]:checked').value === 'true';
    const rating = parseInt(document.getElementById('rating').value);
    const participants = document.getElementById('participants').value;
    const absent = document.getElementById('absent').value;
    const weather = document.getElementById('weather').value;
    const activities = document.getElementById('activities').value;
    const games = document.getElementById('games').value;
    const notes = document.getElementById('notes').value;
    const photo = document.getElementById('photo').value;
    
    // Проверка обязательных полей
    if (!participants.trim() || !weather || !activities.trim() || !games.trim()) {
        alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
        return;
    }
    
    // Сохраняем событие
    summerData.events[date] = {
        walked,
        rating,
        participants: participants.trim(),
        absent: absent.trim(),
        weather,
        activities: activities.trim(),
        games: games.trim(),
        notes: notes.trim(),
        photo: photo.trim(),
        created: new Date().toISOString()
    };
    
    saveData();
    renderCalendar(currentDate);
    showDayDetails(date);
    eventModal.style.display = 'none';
    
    alert('Запись сохранена!');
});

// Обновление статистики
function updateStats() {
    const events = Object.values(summerData.events);
    
    if (events.length === 0) {
        document.getElementById('days-passed').textContent = '0';
        document.getElementById('days-walked').textContent = '0';
        document.getElementById('avg-rating').textContent = '0.0';
        document.getElementById('sunny-days').textContent = '0';
        return;
    }
    
    const daysWalked = events.filter(e => e.walked).length;
    const totalRating = events.reduce((sum, e) => sum + (e.rating || 0), 0);
    const sunnyDays = events.filter(e => e.weather === 'sunny').length;
    
    // Подсчитываем дни в пределах лета 2026
    const start = new Date('2026-06-01');
    const end = new Date('2026-08-31');
    const today = new Date();
    const currentDateForCalc = today >= start && today <= end ? today : start;
    const daysPassed = Math.floor((currentDateForCalc - start) / (1000 * 60 * 60 * 24)) + 1;
    
    document.getElementById('days-passed').textContent = Math.min(daysPassed, 92);
    document.getElementById('days-walked').textContent = daysWalked;
    document.getElementById('avg-rating').textContent = (totalRating / events.length).toFixed(1);
    document.getElementById('sunny-days').textContent = sunnyDays;
}

// Генерация отчета
function generateReport() {
    const events = Object.values(summerData.events);
    
    if (events.length === 0) {
        document.getElementById('reportContent').innerHTML = `
            <div class="report-section">
                <h4>Нет данных для отчета</h4>
                <p>Добавьте записи о днях, чтобы сгенерировать отчет.</p>
            </div>
        `;
        return;
    }
    
    // Основная статистика
    const daysWalked = events.filter(e => e.walked).length;
    const totalRating = events.reduce((sum, e) => sum + (e.rating || 0), 0);
    const avgRating = (totalRating / events.length).toFixed(1);
    
    // Статистика по погоде
    const weatherStats = {};
    events.forEach(e => {
        weatherStats[e.weather] = (weatherStats[e.weather] || 0) + 1;
    });
    
    // Самые популярные активности (собираем из текста)
    const allActivities = events.flatMap(e => 
        e.activities.split('\n').map(a => a.trim()).filter(a => a)
    );
    
    const activityCounts = {};
    allActivities.forEach(act => {
        const cleanAct = act.replace(/[.!?]$/, '').toLowerCase();
        activityCounts[cleanAct] = (activityCounts[cleanAct] || 0) + 1;
    });
    
    const topActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Самые популярные игры
    const allGames = events.flatMap(e => 
        e.games.split('\n').map(g => g.trim()).filter(g => g)
    );
    
    const gameCounts = {};
    allGames.forEach(game => {
        const cleanGame = game.replace(/[.!?]$/, '').toLowerCase();
        gameCounts[cleanGame] = (gameCounts[cleanGame] || 0) + 1;
    });
    
    const topGames = Object.entries(gameCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Лучшие дни по оценке
    const bestDays = [...events]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    
    const reportHTML = `
        <div class="report-section">
            <h4><i class="fas fa-chart-bar"></i> Общая статистика</h4>
            <div class="report-stats">
                <div class="report-stat">
                    <span class="value">${events.length}</span>
                    <span class="label">Всего записей</span>
                </div>
                <div class="report-stat">
                    <span class="value">${daysWalked}</span>
                    <span class="label">Дней гуляли</span>
                </div>
                <div class="report-stat">
                    <span class="value">${avgRating}</span>
                    <span class="label">Средняя оценка</span>
                </div>
                <div class="report-stat">
                    <span class="value">${Math.round(daysWalked / events.length * 100)}%</span>
                    <span class="label">Процент прогулок</span>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h4><i class="fas fa-cloud-sun"></i> Погодная статистика</h4>
            <ul class="top-list">
                ${Object.entries(weatherStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([weather, count]) => `
                        <li>${getWeatherDisplay(weather)}: ${count} дней</li>
                    `).join('')}
            </ul>
        </div>
        
        <div class="report-section">
            <h4><i class="fas fa-running"></i> Топ-5 активностей</h4>
            <ul class="top-list">
                ${topActivities.map(([activity, count]) => `
                    <li>${capitalize(activity)}: ${count} раз</li>
                `).join('')}
            </ul>
        </div>
        
        <div class="report-section">
            <h4><i class="fas fa-gamepad"></i> Топ-5 игр</h4>
            <ul class="top-list">
                ${topGames.map(([game, count]) => `
                    <li>${capitalize(game)}: ${count} раз</li>
                `).join('')}
            </ul>
        </div>
        
        <div class="report-section">
            <h4><i class="fas fa-crown"></i> Лучшие дни</h4>
            <ul class="top-list">
                ${bestDays.map(day => `
                    <li>${formatDateDisplay(new Date(Object.keys(summerData.events)
                        .find(key => summerData.events[key] === day)))}: 
                        ${'★'.repeat(day.rating)} (${day.participants.split(',')[0]}...)
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="report-section">
            <h4><i class="fas fa-comment"></i> Итог</h4>
            <p>За лето 2026 было проведено ${events.length} записанных дней, 
            из которых в ${daysWalked} дней активно гуляли. 
            Средняя оценка удовольствия: ${avgRating} из 5.</p>
            <p>${daysWalked > events.length / 2 ? 
                'Отличный результат! Больше половины дней были активными!' : 
                'Можно было больше гулять, но главное - хорошее настроение!'}</p>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = reportHTML;
    reportModal.style.display = 'flex';
}

// Вспомогательные функции
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('ru-RU', options);
}

function getWeatherDisplay(weather) {
    const weatherMap = {
        sunny: '☀️ Солнечно',
        cloudy: '⛅ Облачно',
        'partly-cloudy': '🌤️ Переменная облачность',
        rainy: '🌧️ Дождь',
        stormy: '⛈️ Гроза',
        windy: '🌬️ Ветрено',
        hot: '🔥 Жарко',
        cool: '🍃 Прохладно'
    };
    return weatherMap[weather] || weather;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateCurrentMonth() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    currentMonthEl.textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Обновляем select
    monthSelect.value = currentDate.getMonth().toString();
}

function updateStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация по месяцам
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
    
    // Выбор месяца из списка
    monthSelect.addEventListener('change', (e) => {
        currentDate.setMonth(parseInt(e.target.value));
        renderCalendar(currentDate);
    });
    
    // Звезды рейтинга
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.value);
            document.getElementById('rating').value = rating;
            updateStars(rating);
        });
    });
    
    // Кнопки
    document.getElementById('addEventBtn').addEventListener('click', () => openEventModal());
    document.getElementById('todayBtn').addEventListener('click', () => {
        const today = new Date();
        if (today >= new Date('2026-06-01') && today <= new Date('2026-08-31')) {
            currentDate = new Date(today);
            renderCalendar(currentDate);
            showDayDetails(formatDate(today));
        } else {
            alert('Сегодня не входит в лето 2026 (июнь-август)');
        }
    });
    
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('printReportBtn').addEventListener('click', () => window.print());
    
    // Закрытие модальных окон
    document.getElementById('closeModal').addEventListener('click', () => {
        eventModal.style.display = 'none';
    });
    
    document.getElementById('closeReportModal').addEventListener('click', () => {
        reportModal.style.display = 'none';
    });
    
    document.getElementById('cancelBtn').addEventListener('click', () => {
        eventModal.style.display = 'none';
    });
    
    // Закрытие по клику вне окна
    window.addEventListener('click', (e) => {
        if (e.target === eventModal) eventModal.style.display = 'none';
        if (e.target === reportModal) reportModal.style.display = 'none';
    });
    
    // Погодные иконки
    document.querySelectorAll('.weather-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const weather = icon.dataset.weather;
            document.getElementById('weather').value = weather;
        });
    });
}

// Экспорт данных
function exportData() {
    const dataStr = JSON.stringify(summerData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `лето-2026-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Данные экспортированы в JSON файл!');
}

// Импорт данных (дополнительная функция)
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            summerData = importedData;
            saveData();
            renderCalendar(currentDate);
            updateStats();
            alert('Данные успешно импортированы!');
        } catch (error) {
            alert('Ошибка при импорте файла');
        }
    };
    reader.readAsText(file);
}

// Автосохранение при закрытии
window.addEventListener('beforeunload', () => {
    if (Object.keys(summerData.events).length > 0) {
        saveData();
    }
});
