document.addEventListener('DOMContentLoaded', function() {
    // 애니메이션 효과를 위한 초기화
    initializeAnimations();
    
    // 검색 기능 추가
    addSearchFunctionality();
    
    // 카드 클릭 이벤트
    addCardInteractions();
    
    // 업무 링크 클릭 추적
    trackTaskClicks();
});

function initializeAnimations() {
    // 페이지 로드 시 카드들이 순차적으로 나타나는 애니메이션
    const cards = document.querySelectorAll('.department-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function addSearchFunctionality() {
    // 검색 바 추가
    const header = document.querySelector('.header .container');
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="업무 검색..." />
            <i class="fas fa-search"></i>
        </div>
    `;
    
    // 로고와 연도 배지 사이에 검색 바 삽입
    header.insertBefore(searchContainer, header.lastElementChild);
    
    // 검색 기능 구현
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterTasks(searchTerm);
    });
}

function filterTasks(searchTerm) {
    const taskLinks = document.querySelectorAll('.task-link');
    const departmentCards = document.querySelectorAll('.department-card');
    
    taskLinks.forEach(link => {
        const taskText = link.textContent.toLowerCase();
        const parentCard = link.closest('.department-card');
        
        if (taskText.includes(searchTerm) || searchTerm === '') {
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });
    
    // 부서 카드 표시/숨김 처리
    departmentCards.forEach(card => {
        const visibleTasks = card.querySelectorAll('.task-link[style*="flex"]');
        const allTasks = card.querySelectorAll('.task-link');
        
        if (searchTerm === '' || visibleTasks.length > 0) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
        
        // 검색 결과가 없는 경우 모든 카드 표시
        if (searchTerm === '') {
            allTasks.forEach(task => {
                task.style.display = 'flex';
            });
        }
    });
}

function addCardInteractions() {
    const departmentCards = document.querySelectorAll('.department-card');
    
    departmentCards.forEach(card => {
        // 카드 헤더 클릭 시 콘텐츠 토글
        const header = card.querySelector('.department-header');
        const content = card.querySelector('.department-content');
        
        header.style.cursor = 'pointer';
        
        header.addEventListener('click', function() {
            const isExpanded = content.style.display !== 'none';
            
            if (isExpanded) {
                content.style.display = 'none';
                card.classList.add('collapsed');
            } else {
                content.style.display = 'block';
                card.classList.remove('collapsed');
            }
        });
    });
}

function trackTaskClicks() {
    const taskLinks = document.querySelectorAll('.task-link');
    
    taskLinks.forEach(link => {
        // 실제 링크가 있는 경우 기본 동작 허용
        if (link.getAttribute('href') !== '#') {
            link.addEventListener('click', function(e) {
                const taskName = this.textContent.trim();
                
                // 클릭 효과
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // 새 탭에서 열리도록 설정
                this.setAttribute('target', '_blank');
                console.log(`${taskName} 링크로 이동`);
            });
        } else {
            // 링크가 없는 경우 기존 동작
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const taskName = this.textContent.trim();
                const departmentName = this.closest('.department-card').querySelector('h2').textContent;
                
                // 클릭 효과
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                console.log(`${departmentName} - ${taskName} 클릭됨`);
                showNotification(`${taskName} 페이지 준비 중입니다.`);
            });
        }
    });
}

function showNotification(message) {
    // 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 애니메이션으로 나타내기
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// CSS 스타일 추가
const additionalStyles = `
    .search-container {
        flex: 1;
        max-width: 400px;
        margin: 0 20px;
    }
    
    .search-box {
        position: relative;
        width: 100%;
    }
    
    .search-box input {
        width: 100%;
        padding: 12px 20px 12px 45px;
        border: 2px solid #e9ecef;
        border-radius: 25px;
        font-size: 1rem;
        outline: none;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.9);
    }
    
    .search-box input:focus {
        border-color: #667eea;
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
        background: white;
    }
    
    .search-box i {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
    }
    
    .department-card.collapsed {
        opacity: 0.7;
    }
    
    @media (max-width: 768px) {
        .search-container {
            margin: 10px 0;
            max-width: 100%;
        }
        
        .header .container {
            flex-direction: column;
        }
    }
`;

// 스타일을 head에 추가
const style = document.createElement('style');
style.textContent = additionalStyles;
document.head.appendChild(style);