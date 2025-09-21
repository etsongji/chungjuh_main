// 충주고등학교 급식정보 API 연동 스크립트
class MealInfoAPI {
    constructor() {
        // 나이스 교육정보 개방포털 API 설정
        this.baseURL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
        this.apiKey = 'cc1b9c0a34804a628cc701f43a8398e1';
        this.schoolCode = '8000078'; // 충주고등학교
        this.officeCode = 'M10'; // 충청북도교육청
        
        this.currentDate = new Date();
        
        this.initializeMealSection();
        this.loadMealInfo();
    }

    // 급식 섹션 HTML 생성
    initializeMealSection() {
        const mainContainer = document.querySelector('.main .container');
        const calendarSection = document.querySelector('.calendar-section');
        
        const mealSection = document.createElement('div');
        mealSection.className = 'meal-section';
        mealSection.innerHTML = `
            <div class="meal-header">
                <h2><i class="fas fa-utensils"></i> 충주고등학교 급식</h2>
                <div class="meal-date-controls">
                    <button id="prevDay" class="meal-nav-btn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span id="mealDate" class="meal-date"></span>
                    <button id="nextDay" class="meal-nav-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            <div class="meal-content">
                <div id="mealInfo" class="meal-info">
                    <div class="loading">급식 정보를 불러오는 중...</div>
                </div>
            </div>
        `;

        // 캘린더 섹션 다음에 급식 섹션 추가
        calendarSection.insertAdjacentElement('afterend', mealSection);
        
        this.setupEventListeners();
        this.addMealStyles();
        this.updateDateDisplay();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        const prevBtn = document.getElementById('prevDay');
        const nextBtn = document.getElementById('nextDay');

        prevBtn.addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() - 1);
            this.updateDateDisplay();
            this.loadMealInfo();
        });

        nextBtn.addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() + 1);
            this.updateDateDisplay();
            this.loadMealInfo();
        });
    }

    // 날짜 표시 업데이트
    updateDateDisplay() {
        const mealDateElement = document.getElementById('mealDate');
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        mealDateElement.textContent = this.currentDate.toLocaleDateString('ko-KR', options);
    }

    // 날짜를 YYYYMMDD 형식으로 변환
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    // 급식 정보 로드
    async loadMealInfo() {
        const mealInfoDiv = document.getElementById('mealInfo');
        mealInfoDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 급식 정보를 불러오는 중...</div>';

        try {
            const dateStr = this.formatDate(this.currentDate);
            
            const url = `${this.baseURL}?KEY=${this.apiKey}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${this.officeCode}&SD_SCHUL_CODE=${this.schoolCode}&MLSV_YMD=${dateStr}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            this.displayMealInfo(data);
            
        } catch (error) {
            console.error('급식 정보 로드 오류:', error);
            mealInfoDiv.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>급식 정보를 불러오는데 실패했습니다.</p>
                    <button onclick="mealAPI.loadMealInfo()" class="retry-btn">다시 시도</button>
                </div>
            `;
        }
    }

    // 급식 정보 표시
    displayMealInfo(data) {
        const mealInfoDiv = document.getElementById('mealInfo');
        
        // API 응답 구조 확인
        if (!data.mealServiceDietInfo) {
            mealInfoDiv.innerHTML = `
                <div class="no-meal">
                    <i class="fas fa-calendar-times"></i>
                    <p>해당 날짜에 급식 정보가 없습니다.</p>
                    <small>주말이나 공휴일일 수 있습니다.</small>
                </div>
            `;
            return;
        }

        const meals = data.mealServiceDietInfo[1].row;
        
        let mealHTML = '<div class="meals-container">';
        
        meals.forEach(meal => {
            // 급식 종류 (조식, 중식, 석식)
            const mealType = this.getMealTypeName(meal.MMEAL_SC_NM);
            
            // 메뉴 정보 (HTML 태그 제거 및 포맷팅)
            const menuItems = meal.DDISH_NM
                .replace(/<br\/>/g, '\n')
                .replace(/<[^>]*>/g, '')
                .split('\n')
                .filter(item => item.trim());

            // 칼로리 정보
            const calories = meal.CAL_INFO || '정보 없음';
            
            // 영양 정보
            const nutrition = meal.NTR_INFO 
                ? meal.NTR_INFO.replace(/<br\/>/g, ' | ')
                : '영양 정보 없음';

            mealHTML += `
                <div class="meal-card">
                    <div class="meal-type">
                        <i class="fas ${this.getMealIcon(meal.MMEAL_SC_NM)}"></i>
                        <span>${mealType}</span>
                    </div>
                    <div class="meal-menu">
                        ${menuItems.map(item => `<div class="menu-item">${item}</div>`).join('')}
                    </div>
                    <div class="meal-info-details">
                        <div class="calories">
                            <i class="fas fa-fire"></i>
                            <span>칼로리: ${calories}</span>
                        </div>
                        <div class="nutrition">
                            <i class="fas fa-leaf"></i>
                            <span>영양정보: ${nutrition}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        mealHTML += '</div>';
        mealInfoDiv.innerHTML = mealHTML;
    }

    // 급식 종류명 변환
    getMealTypeName(code) {
        const mealTypes = {
            '1': '조식',
            '2': '중식', 
            '3': '석식'
        };
        return mealTypes[code] || '급식';
    }

    // 급식 아이콘 반환
    getMealIcon(code) {
        const icons = {
            '1': 'fa-sun',      // 조식
            '2': 'fa-utensils', // 중식
            '3': 'fa-moon'      // 석식
        };
        return icons[code] || 'fa-utensils';
    }

    // 급식 섹션 스타일 추가
    addMealStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .meal-section {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                margin-bottom: 40px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .meal-header {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                padding: 25px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
            }

            .meal-header h2 {
                font-size: 1.5rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 15px;
                margin: 0;
            }

            .meal-header i {
                font-size: 1.8rem;
            }

            .meal-date-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .meal-nav-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 10px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .meal-nav-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }

            .meal-date {
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 500;
                min-width: 200px;
                text-align: center;
            }

            .meal-content {
                padding: 25px;
                background: white;
            }

            .meals-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .meal-card {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                border-left: 5px solid #e74c3c;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }

            .meal-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }

            .meal-type {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                font-weight: 600;
                font-size: 1.1rem;
                color: #2c3e50;
            }

            .meal-type i {
                color: #e74c3c;
                font-size: 1.2rem;
            }

            .meal-menu {
                margin-bottom: 15px;
            }

            .menu-item {
                background: white;
                padding: 8px 12px;
                margin-bottom: 5px;
                border-radius: 5px;
                border-left: 3px solid #3498db;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }

            .menu-item:hover {
                background: #f0f8ff;
                transform: translateX(3px);
            }

            .meal-info-details {
                border-top: 1px solid #dee2e6;
                padding-top: 15px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size: 0.85rem;
                color: #6c757d;
            }

            .calories, .nutrition {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .calories i {
                color: #f39c12;
            }

            .nutrition i {
                color: #27ae60;
            }

            .loading, .error, .no-meal {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
            }

            .loading i, .error i, .no-meal i {
                font-size: 2rem;
                margin-bottom: 15px;
                display: block;
            }

            .error {
                color: #e74c3c;
            }

            .retry-btn {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
                transition: all 0.3s ease;
            }

            .retry-btn:hover {
                background: #c0392b;
            }

            .fa-spin {
                animation: fa-spin 2s infinite linear;
            }

            @keyframes fa-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(359deg); }
            }

            @media (max-width: 768px) {
                .meal-header {
                    flex-direction: column;
                    text-align: center;
                }

                .meal-date-controls {
                    order: 1;
                }

                .meal-header h2 {
                    order: 2;
                    font-size: 1.3rem;
                }

                .meal-date {
                    font-size: 0.9rem;
                    min-width: 150px;
                }

                .meals-container {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }

                .meal-card {
                    padding: 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// DOMContentLoaded 이벤트에 급식 API 초기화 추가
document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화 함수들
    initializeAnimations();
    addSearchFunctionality();
    addCardInteractions();
    trackTaskClicks();
    
    // 급식 정보 API 초기화
    window.mealAPI = new MealInfoAPI();
});