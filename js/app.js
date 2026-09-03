/**
 * आरक्षण हटाओ आंदोलन (RHA) - मुख्य ऍप्लिकेशन लॉजिक & View Router (Main Application & Router Script)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State
    const state = {
        currentView: 'home',
        selectedDailyLogDate: 'all',
        selectedTimelineCategory: 'all',
        quoteSearchQuery: '',
        quoteFilterEra: 'all',
        quoteFilterState: 'all',
        quoteFilterStance: 'all',
        selectedSloganCategory: 'all',
        sloganSearchQuery: ''
    };

    window.rhaState = state;

    // Initialize all components
    initNavbar();
    renderStats();
    renderStudentImpact();
    renderSolutionPillars();
    renderGlobalMeritocracy();
    renderToolkitTweets();
    renderArticle334Extensions();
    renderTimeline();
    renderAgitations();
    renderLeaderQuotes();
    renderSlogans();
    renderMythsVsFacts();
    renderCommunityLogs();
    initSearchAndFilters();
    initRouter();
    startLiveTicker();
    updateCalcExamPlaceholder();
});

/* ==========================================================================
   2. Modular SPA Router & View Switcher (दृश्य नियंत्रक)
   ========================================================================== */

const VALID_VIEWS = ['home', 'community-log', 'calculator', 'solution', 'student-impact', 'global', 'history', 'ten-year-limit', 'agitations', 'leaders-quotes', 'slogans', 'toolkit', 'facts-myths'];

window.navigateTo = function(viewName, updateHash = true) {
    if (!VALID_VIEWS.includes(viewName)) {
        viewName = 'home';
    }

    if (window.rhaState) {
        window.rhaState.currentView = viewName;
    }

    // 1. Toggle Page Views
    const views = document.querySelectorAll('.page-view');
    views.forEach(view => {
        if (view.id === `view-${viewName}`) {
            view.classList.add('active-view');
        } else {
            view.classList.remove('active-view');
        }
    });

    // 2. Update Desktop & Mobile Navbar Active States
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
        const targetNav = link.getAttribute('data-nav');
        if (targetNav === viewName) {
            link.classList.add('active-nav', 'text-orange-400');
            link.classList.remove('text-slate-300');
        } else {
            link.classList.remove('active-nav', 'text-orange-400');
            link.classList.add('text-slate-300');
        }
    });

    // 3. Close Mobile Menu if Open
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }

    // 4. Update URL Hash
    if (updateHash) {
        window.location.hash = viewName;
    }

    // 5. Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 6. Refresh Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
};

function initRouter() {
    // Handle initial hash on page load
    const initialHash = window.location.hash.replace('#', '').trim();
    if (initialHash && VALID_VIEWS.includes(initialHash)) {
        navigateTo(initialHash, false);
    } else {
        navigateTo('home', false);
    }

    // Listen to browser Back/Forward navigation
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.replace('#', '').trim();
        if (newHash && VALID_VIEWS.includes(newHash)) {
            navigateTo(newHash, false);
        } else {
            navigateTo('home', false);
        }
    });
}

/* ==========================================================================
   3. UI Helper Functions & Toast Notification
   ========================================================================== */

function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-sm transition-all duration-300 pointer-events-auto';
        document.body.appendChild(toast);
    }

    const bgColors = {
        success: 'bg-emerald-600 border border-emerald-400',
        info: 'bg-blue-600 border border-blue-400',
        warning: 'bg-amber-600 border border-amber-400',
        error: 'bg-red-600 border border-red-400'
    };

    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-sm transition-all duration-300 pointer-events-auto ${bgColors[type] || bgColors.success} show`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle-2' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5"></i>
        <span>${message}</span>
    `;
    
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

// Copy to Clipboard Utility
window.copyToClipboard = function(text, successMsg = 'सफलतापूर्वक कॉपी हो गया!') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(successMsg, 'success');
    });
};

// Share to WhatsApp Utility. Keep the URL on its own unformatted line so
// WhatsApp reliably detects it as a clickable link on web and desktop.
window.shareOnWhatsApp = function(text, specificHash = '') {
    const baseUrl = 'https://rhaindia.me/';
    const targetUrl = specificHash ? `${baseUrl}#${specificHash.replace(/^#/, '')}` : baseUrl;
    const fullMessage = `${text.trim()}\n\n🔗 अधिक जानकारी के लिए देखें:\n${targetUrl}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    
    // On mobile devices, window.location.href directly opens WhatsApp app without popup blockers
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobile) {
        window.location.href = shareUrl;
    } else {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
};

/* ==========================================================================
   4. Navbar & Mobile Menu Navigation
   ========================================================================== */

function initNavbar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Scroll Navbar Background Effect
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('bg-slate-950/95', 'shadow-xl', 'border-b', 'border-slate-800');
            navbar.classList.remove('bg-slate-950/80');
        } else {
            navbar.classList.remove('bg-slate-950/95', 'shadow-xl');
            navbar.classList.add('bg-slate-950/80');
        }
    });
}

/* ==========================================================================
   5. Stats & Counters
   ========================================================================== */

function renderStats() {
    const originalTermEl = document.getElementById('statOriginalTerm');
    const runningYearsEl = document.getElementById('statRunningYears');
    const extensionsEl = document.getElementById('statExtensions');
    const scLimitEl = document.getElementById('statScLimit');

    if (originalTermEl) originalTermEl.textContent = RHA_DATA.stats.originalTermYears + ' वर्ष';
    if (runningYearsEl) runningYearsEl.textContent = RHA_DATA.stats.currentYearsRunning + '+ वर्ष';
    if (extensionsEl) extensionsEl.textContent = RHA_DATA.stats.extensionsCount + ' बार';
    if (scLimitEl) scLimitEl.textContent = RHA_DATA.stats.scLimitPercent + '% सीमा';
}

/* ==========================================================================
   5.5 Student Impact Rendering (विद्यार्थियों का नुकसान व आंकड़े)
   ========================================================================== */

function renderStudentImpact() {
    const data = RHA_DATA.studentImpactData;
    if (!data) return;

    // 1. Render Exam Disparities
    const examContainer = document.getElementById('examDisparitiesContainer');
    if (examContainer && data.examDisparities) {
        examContainer.innerHTML = data.examDisparities.map(item => `
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-red-500/50 transition-all flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                        <h4 class="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            <i data-lucide="award" class="w-5 h-5 text-orange-400"></i>
                            <span>${item.exam}</span>
                        </h4>
                        <span class="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                            कट-ऑफ खाई
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mb-4 text-xs md:text-sm">
                        <div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                            <span class="text-xs font-bold text-slate-400 block mb-1">सामान्य वर्ग कट-ऑफ:</span>
                            <span class="font-bold text-red-300 font-mono text-sm md:text-base">${item.generalCutoff}</span>
                        </div>
                        <div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                            <span class="text-xs font-bold text-slate-400 block mb-1">आरक्षित वर्ग कट-ऑफ:</span>
                            <span class="font-bold text-emerald-400 font-mono text-sm md:text-base">${item.reservedCutoff}</span>
                        </div>
                    </div>

                    <p class="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                        <strong class="text-amber-400">असर:</strong> ${item.impact}
                    </p>
                </div>
            </div>
        `).join('');
    }

    // 2. Render Harm Dimensions
    const harmContainer = document.getElementById('harmDimensionsContainer');
    if (harmContainer && data.harmDimensions) {
        harmContainer.innerHTML = data.harmDimensions.map((dim, idx) => {
            const icons = ['target', 'plane-takeoff', 'users', 'heart-crack'];
            const colors = ['text-red-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400'];
            return `
                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 ${colors[idx % colors.length]} flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${icons[idx % icons.length]}" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h4 class="text-base md:text-lg font-bold text-white mb-2">${dim.title}</h4>
                        <p class="text-xs md:text-sm text-slate-300 leading-relaxed">${dim.desc}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   5.6 Solution Blueprint & Global Models Rendering
   ========================================================================== */

function renderSolutionPillars() {
    const container = document.getElementById('solutionPillarsContainer');
    if (!container || !RHA_DATA.economicJusticeModel) return;

    container.innerHTML = RHA_DATA.economicJusticeModel.principles.map(p => `
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-xl hover:border-emerald-500/50 transition-all">
            <h4 class="text-lg md:text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-400 flex-shrink-0"></i>
                <span>${p.title}</span>
            </h4>
            <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
                ${p.desc}
            </p>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function renderGlobalMeritocracy() {
    const container = document.getElementById('globalMeritocracyContainer');
    if (!container || !RHA_DATA.globalMeritocracy) return;

    container.innerHTML = RHA_DATA.globalMeritocracy.map(item => `
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-xl hover:border-blue-500/50 transition-all flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                    <h4 class="text-xl font-black text-white flex items-center gap-2.5">
                        <span class="text-2xl">${item.flag}</span>
                        <span>${item.country}</span>
                    </h4>
                    <span class="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        ${item.model}
                    </span>
                </div>
                <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
                    ${item.detail}
                </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                <i data-lucide="award" class="w-3.5 h-3.5 text-blue-400"></i>
                <span>केवल विशुद्ध योग्यता (Merit) + 100% आर्थिक सहयोग नीति</span>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function renderToolkitTweets() {
    const container = document.getElementById('toolkitTweetsContainer');
    if (!container || !RHA_DATA.campaignToolkit) return;

    container.innerHTML = RHA_DATA.campaignToolkit.tweetTemplates.map((t, idx) => `
        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex-1">
                <div class="text-xs font-bold text-sky-400 mb-1">#${idx + 1} ${t.title}</div>
                <p class="text-xs md:text-sm text-slate-200 font-medium">"${t.text}"</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="copyToClipboard('${t.text.replace(/'/g, "\\'")}', 'ट्वीट कॉपी हो गया!')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    <span>कॉपी</span>
                </button>
                <button onclick="window.openTweetIntent('${encodeURIComponent(t.text)}')" class="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all">
                    <i data-lucide="send" class="w-3.5 h-3.5"></i>
                    <span>X पर पोस्ट करें</span>
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   5.7 Interactive Merit vs Quota Calculator Logic
   ========================================================================== */

window.updateCalcExamPlaceholder = function() {
    const examSelect = document.getElementById('calcExamSelect');
    const scoreInput = document.getElementById('calcScoreInput');
    const scoreLabel = document.getElementById('calcScoreLabel');
    if (!examSelect || !scoreInput) return;

    const examKey = examSelect.value;
    const config = RHA_DATA.calculatorConfig.exams[examKey];
    if (!config) return;

    scoreLabel.textContent = `2. अपना स्कोर / ${config.unit} दर्ज करें (अधिकतम ${config.maxScore}):`;
    if (examKey === 'neet') scoreInput.placeholder = "उदा. 610 (NEET कुल 720)";
    else if (examKey === 'upsc') scoreInput.placeholder = "उदा. 86 (UPSC Prelims कुल 200)";
    else if (examKey === 'jee') scoreInput.placeholder = "उदा. 92.5 (JEE Percentile %)";
    else if (examKey === 'ssc') scoreInput.placeholder = "उदा. 148 (SSC CGL कुल 200)";
};

window.runMeritCalculation = function() {
    const examSelect = document.getElementById('calcExamSelect');
    const scoreInput = document.getElementById('calcScoreInput');
    const resultContainer = document.getElementById('calcResultContainer');
    if (!examSelect || !scoreInput || !resultContainer) return;

    const examKey = examSelect.value;
    const score = parseFloat(scoreInput.value);
    const config = RHA_DATA.calculatorConfig.exams[examKey];

    if (isNaN(score) || score < 0 || score > config.maxScore) {
        showToast(`कृपया 0 से ${config.maxScore} के बीच वैध स्कोर दर्ज करें।`, 'error');
        return;
    }

    const inGeneral = score >= config.generalCutoff;
    const inObc = score >= config.obcCutoff;
    const inSc = score >= config.scCutoff;
    const inSt = score >= config.stCutoff;

    let verdictBadge = '';
    let verdictText = '';
    let disparityAnalysis = '';

    if (!inGeneral && inObc) {
        verdictBadge = '<span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">⚠️ आरक्षण विसंगति का शिकार</span>';
        verdictText = `आपके <strong>${score} ${config.unit}</strong> हैं। सामान्य वर्ग में होने के कारण आप <strong>चयन से बाहर</strong> हैं, जबकि OBC/SC/ST कोटे में आपका <strong>निश्चित चयन</strong> हो जाता!`;
        disparityAnalysis = `सामान्य वर्ग कट-ऑफ <strong>${config.generalCutoff}</strong> है, जबकि आरक्षित न्यूनतम कट-ऑफ <strong>${config.reservedLowest}</strong> है। आप 90%+ प्रतिभा लेकर भी जातिगत आरक्षण के कारण बाहर हो गए।`;
    } else if (!inGeneral && (inSc || inSt)) {
        verdictBadge = '<span class="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold">🚨 भारी कट-ऑफ अन्याय</span>';
        verdictText = `आपके <strong>${score} ${config.unit}</strong> हैं। सामान्य वर्ग में होने से आपको <strong>सीट नहीं मिली</strong>, जबकि आरक्षित वर्ग में <strong>${config.stCutoff}</strong> अंकों पर भी शीर्ष सीट मिल जाती!`;
        disparityAnalysis = `आपने 18-20 घंटे पढ़ाई करके शानदार स्कोर किया, किंतु जातिगत दीवार ने आपका हक छीन लिया। यदि सहायता केवल आर्थिक आधार पर होती तो मेधावी छात्रों का भविष्य सुरक्षित होता।`;
    } else if (!inGeneral && !inSt) {
        verdictBadge = '<span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">ℹ️ सुधार की आवश्यकता</span>';
        verdictText = `आपका स्कोर <strong>${score} ${config.unit}</strong> है। इस परीक्षा में कट-ऑफ <strong>${config.generalCutoff}</strong> है।`;
        disparityAnalysis = `आरक्षण प्रणाली में यदि आप आरक्षित श्रेणी में होते तो <strong>${config.reservedLowest}</strong> अंकों पर भी अवसर मिल सकता था। हमारा विजन है कि सभी जरूरतमंदों को मुफ्त कोचिंग मिले ताकि हर कोई मेरिट में 80%+ स्कोर कर सके।`;
    } else {
        verdictBadge = '<span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">🎉 असाधारण मेरिट प्रतिभा</span>';
        verdictText = `बधाई! आपके <strong>${score} ${config.unit}</strong> सामान्य वर्ग की कट-ऑफ (<strong>${config.generalCutoff}</strong>) से ऊपर हैं। आप विशुद्ध मेरिट से सफल हैं।`;
        disparityAnalysis = `किंतु स्मरण रहे कि 50% से अधिक सीटें आरक्षित होने के कारण सामान्य वर्ग के 1 अंक भी कम लाने वाले मेधावी सहपाठी बाहर हो जाते हैं। आरक्षण जाति से नहीं, केवल आर्थिक आधार पर होना चाहिए।`;
    }

    const shareVerdict = `🧮 *मेरी योग्यता का सच (RHA कैलकुलेटर रिजल्ट):*\n\n📚 परीक्षा: ${config.name}\n🎯 मेरा स्कोर: ${score} ${config.unit}\n⚖️ सामान्य कट-ऑफ: ${config.generalCutoff}\n👉 निष्कर्ष: ${score >= config.generalCutoff ? 'मेरिट पर सफल!' : 'आरक्षण विसंगति का शिकार!'}\n\n🔥 *आरक्षण देना ही है तो जाति के आधार पर नहीं, बल्कि आर्थिक आधार पर दो!*\n\nआप भी जांचें: आरक्षण हटाओ आंदोलन (RHA)`;

    resultContainer.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                    <span class="text-base font-bold text-white">${config.name} परिणाम विश्लेषण:</span>
                </div>
                ${verdictBadge}
            </div>

            <p class="text-sm md:text-base text-slate-200 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800">
                ${verdictText}
            </p>

            <div class="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs md:text-sm text-slate-300 leading-relaxed">
                <strong class="text-amber-400">विस्तृत विश्लेषण:</strong> ${disparityAnalysis}
            </div>

            <div class="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div class="text-xs text-slate-400 font-mono">
                    सामान्य: ${config.generalCutoff} | OBC: ${config.obcCutoff} | SC: ${config.scCutoff} | ST: ${config.stCutoff}
                </div>
                <button onclick="shareOnWhatsApp(decodeURIComponent('${encodeURIComponent(shareVerdict)}'))" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2">
                    <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                    <span>अपना रिजल्ट WhatsApp पर शेयर करें</span>
                </button>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
    showToast('गणना पूर्ण हुई!', 'success');
};

/* ==========================================================================
   5.8 Live Ticker & Social Utilities
   ========================================================================== */

function startLiveTicker() {
    const tickerStudents = document.getElementById('tickerStudents');
    const tickerMoney = document.getElementById('tickerMoney');
    if (!tickerStudents || !tickerMoney) return;

    let baseStudents = 1335000;
    let baseMoney = 350000;

    setInterval(() => {
        baseStudents += Math.floor(Math.random() * 2);
        baseMoney += Math.floor(Math.random() * 5);
        tickerStudents.textContent = baseStudents.toLocaleString('en-IN') + '+';
        tickerMoney.textContent = '₹' + baseMoney.toLocaleString('en-IN') + ' करोड़';
    }, 4000);
}

window.openTweetIntent = function(encodedText) {
    const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(url, '_blank');
};

window.printFactsheet = function() {
    window.print();
};

function renderArticle334Extensions() {
    const container = document.getElementById('article334TableBody');
    if (!container) return;

    container.innerHTML = RHA_DATA.article334Extensions.map((item, index) => {
        const isOriginal = index === 0;
        const isLatest = index === RHA_DATA.article334Extensions.length - 1;

        return `
            <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                    ${isOriginal ? '<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>' : ''}
                    ${isLatest ? '<span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>' : ''}
                    <span>${item.amendment}</span>
                </td>
                <td class="py-3 px-4 text-slate-300 font-mono">${item.year}</td>
                <td class="py-3 px-4 text-amber-300 font-bold font-mono">${item.extendedTill} तक</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs rounded-md ${isOriginal ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/30'}">
                        ${item.duration}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

/* ==========================================================================
   7. Timeline Rendering (आरक्षण का संपूर्ण इतिहास)
   ========================================================================== */

function renderTimeline(filter = 'all') {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    const filtered = filter === 'all' 
        ? RHA_DATA.history.timeline 
        : RHA_DATA.history.timeline.filter(t => t.type === filter);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-slate-400">कोई घटना नहीं मिली।</div>`;
        return;
    }

    container.innerHTML = filtered.map((event, index) => {
        const isEven = index % 2 === 0;
        return `
            <div class="relative flex flex-col md:flex-row items-center mb-10 group">
                <!-- Center Dot -->
                <div class="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-4 border-orange-500 flex items-center justify-center z-10 shadow-lg group-hover:scale-125 transition-transform duration-300">
                    <span class="w-2 h-2 rounded-full bg-orange-400"></span>
                </div>

                <!-- Content Card (Left or Right on desktop) -->
                <div class="ml-12 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-10 md:text-right' : 'md:pl-10 md:ml-auto'} w-full">
                    <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all duration-300">
                        <div class="flex flex-wrap items-center gap-2 mb-2 ${isEven ? 'md:justify-end' : 'justify-start'}">
                            <span class="px-3 py-1 text-xs font-bold font-mono rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                                📅 ${event.date}
                            </span>
                            <span class="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-slate-300">
                                ${event.badge}
                            </span>
                        </div>

                        <h3 class="text-xl font-bold text-white mb-2">${event.title}</h3>
                        
                        <div class="space-y-1 text-sm text-slate-300 mb-3">
                            <p><strong class="text-slate-400">लागूकर्ता:</strong> ${event.introducedBy}</p>
                            <p><strong class="text-slate-400">उद्देश्य/वर्ग:</strong> ${event.target}</p>
                            <p><strong class="text-amber-400">निर्धारित अवधि:</strong> ${event.duration}</p>
                        </div>

                        <p class="text-slate-400 text-sm leading-relaxed border-t border-slate-700/60 pt-3">
                            ${event.description}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   8. Anti-Reservation Agitations Rendering (ऐतिहासिक आंदोलन 1981-2026)
   ========================================================================== */

function renderAgitations() {
    const container = document.getElementById('agitationsContainer');
    if (!container) return;

    if (!RHA_DATA.antiReservationAgitations || RHA_DATA.antiReservationAgitations.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-slate-400">कोई आंदोलन डेटा उपलब्ध नहीं है।</div>`;
        return;
    }

    container.innerHTML = RHA_DATA.antiReservationAgitations.map((agitation, index) => {
        const shareText = `🔥 *${agitation.title}*\n📍 कहाँ हुआ: ${agitation.location}\n🎯 कारण: ${agitation.cause}\n✊ परिणाम: ${agitation.outcomes}\n\n#ReservationHatao #RHA`;
        const isLive = agitation.isLive === true;

        return `
            <div class="${isLive ? 'bg-gradient-to-br from-slate-900 via-orange-950/30 to-slate-900 border-2 border-orange-500/90 shadow-2xl shadow-orange-500/20' : 'bg-slate-800/90 border border-slate-700/80 hover:border-orange-500/60'} rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                    <!-- Top Badges -->
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div class="flex items-center gap-2">
                            <span class="px-3.5 py-1 text-sm font-black font-mono rounded-xl ${isLive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'} shadow-sm">
                                📅 ${agitation.year}
                            </span>
                            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
                                ${agitation.period}
                            </span>
                        </div>
                        ${isLive ? `
                            <span class="px-3 py-1 text-xs font-black rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400 flex items-center gap-1.5 pulse-badge">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                <span>2026 सक्रिय आंदोलन</span>
                            </span>
                        ` : `
                            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                                🚩 ${agitation.badge}
                            </span>
                        `}
                    </div>

                    <!-- Title -->
                    <h3 class="text-xl md:text-2xl font-black ${isLive ? 'text-orange-300' : 'text-white'} mb-4 group-hover:text-orange-400 transition-colors leading-snug">
                        ${agitation.title}
                    </h3>

                    <!-- Details Grid -->
                    <div class="space-y-3.5 text-xs md:text-sm text-slate-300 mb-6 bg-slate-900/60 p-4 md:p-5 rounded-2xl border border-slate-800">
                        <div class="flex items-start gap-2.5">
                            <span class="font-bold text-orange-400 flex items-center gap-1.5 flex-shrink-0 w-28">
                                <i data-lucide="map-pin" class="w-4 h-4 text-orange-400"></i>
                                <span>कहाँ हुआ:</span>
                            </span>
                            <span class="text-slate-200 font-medium">${agitation.location}</span>
                        </div>

                        <div class="flex items-start gap-2.5">
                            <span class="font-bold text-amber-400 flex items-center gap-1.5 flex-shrink-0 w-28">
                                <i data-lucide="users" class="w-4 h-4 text-amber-400"></i>
                                <span>किसने किया:</span>
                            </span>
                            <span class="text-slate-300"><strong>${agitation.organizers}</strong> (प्रमुख चेहरे: ${agitation.keyFigures})</span>
                        </div>

                        <div class="flex items-start gap-2.5">
                            <span class="font-bold text-red-400 flex items-center gap-1.5 flex-shrink-0 w-28">
                                <i data-lucide="target" class="w-4 h-4 text-red-400"></i>
                                <span>क्यों हुआ:</span>
                            </span>
                            <span class="text-slate-300 leading-relaxed">${agitation.cause}</span>
                        </div>

                        <div class="flex items-start gap-2.5">
                            <span class="font-bold text-blue-400 flex items-center gap-1.5 flex-shrink-0 w-28">
                                <i data-lucide="flame" class="w-4 h-4 text-blue-400"></i>
                                <span>तरीका:</span>
                            </span>
                            <span class="text-slate-300">${agitation.methods}</span>
                        </div>
                    </div>

                    <!-- Outcome Block -->
                    <div class="p-4 rounded-2xl ${isLive ? 'bg-orange-950/40 border border-orange-500/50 text-orange-200' : 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-200'} text-xs md:text-sm mb-4">
                        <div class="font-bold ${isLive ? 'text-orange-400' : 'text-emerald-400'} flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                            <i data-lucide="${isLive ? 'zap' : 'award'}" class="w-4 h-4"></i>
                            <span>${isLive ? 'वर्तमान स्थिति व राष्ट्रव्यापी प्रभाव:' : 'आंदोलन का असर व परिणाम:'}</span>
                        </div>
                        <p class="leading-relaxed text-slate-200">${agitation.outcomes}</p>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <span class="text-xs ${isLive ? 'text-orange-400 font-bold' : 'text-slate-400'} font-mono">
                        #${agitation.tag}
                    </span>
                    <div class="flex items-center gap-2">
                        <button onclick="copyToClipboard('${agitation.title.replace(/'/g, "\\'")} - ${agitation.cause.replace(/'/g, "\\'")}', 'आंदोलन की जानकारी कॉपी हो गई!')" class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors">
                            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                            <span>कॉपी करें</span>
                        </button>
                        <button onclick="shareOnWhatsApp(decodeURIComponent('${encodeURIComponent(shareText)}'))" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                            <span>WhatsApp शेयर</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   9. Political Leaders Quotes Rendering & Search/Filter (नेताओं के बयान)
   ========================================================================== */

function renderLeaderQuotes() {
    const container = document.getElementById('leaderQuotesContainer');
    const searchInput = document.getElementById('leaderQuoteSearch');
    const stanceFilter = document.getElementById('leaderStanceFilter');
    const stateFilter = document.getElementById('leaderStateFilter');
    if (!container) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const stance = stanceFilter ? stanceFilter.value : 'all';
    const selectedState = stateFilter ? stateFilter.value : 'all';
    const era = window.rhaState ? window.rhaState.quoteFilterEra : 'all';

    const filtered = RHA_DATA.leaderQuotes.filter(item => {
        // Query Match
        const matchesQuery = query === '' || 
            item.leader.toLowerCase().includes(query) ||
            item.role.toLowerCase().includes(query) ||
            item.quote.toLowerCase().includes(query) ||
            item.date.toLowerCase().includes(query) ||
            item.party.toLowerCase().includes(query) ||
            (item.state && item.state.toLowerCase().includes(query)) ||
            item.category.toLowerCase().includes(query);

        // Stance / Topic Match
        const matchesStance = stance === 'all' || item.stance === stance;

        // State Match
        const matchesState = selectedState === 'all' || (item.state && item.state.includes(selectedState));

        // Era Match
        let matchesEra = true;
        if (era === 'recent') {
            matchesEra = item.isRecent === true;
        } else if (era === 'historic') {
            matchesEra = item.isRecent === false;
        }

        return matchesQuery && matchesStance && matchesState && matchesEra;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
                <i data-lucide="search-x" class="w-12 h-12 text-slate-500 mx-auto mb-3"></i>
                <p class="text-lg font-semibold text-slate-300">कोई बयान नहीं मिला</p>
                <p class="text-sm text-slate-500 mt-1">कृपया कोई अन्य नाम, राज्य या फ़िल्टर चुनें</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = filtered.map(quote => {
        const stanceBadges = {
            against_caste_quota: { text: 'जातिगत आरक्षण विरोध / मेरिट', class: 'bg-red-500/20 text-red-300 border-red-500/40' },
            time_bound: { text: '10 वर्ष की समय सीमा', class: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
            review_demand: { text: 'समीक्षा की मांग', class: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
            economic_basis: { text: 'आर्थिक आधार (EWS)', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            exceed_50_cap: { text: '🚨 50% से अधिक आरक्षण बढ़ाने की मांग', class: 'bg-rose-600/30 text-rose-300 border-rose-500/60 font-bold' },
            maratha_quota: { text: 'मराठा OBC आरक्षण मांग', class: 'bg-orange-500/25 text-orange-300 border-orange-500/50' },
            obc_protection: { text: 'OBC कोटा संरक्षण', class: 'bg-amber-500/25 text-amber-300 border-amber-500/50' },
            anti_creamy_layer: { text: 'SC/ST उप-वर्गीकरण व क्रीमी लेयर विरोध', class: 'bg-red-500/25 text-red-300 border-red-500/50' },
            bihar_65_quota: { text: 'बिहार 65% आरक्षण व 50% सीमा विवाद', class: 'bg-indigo-500/25 text-indigo-300 border-indigo-500/50' },
            local_private_quota: { text: 'निजी कंपनियों में स्थानीय आरक्षण', class: 'bg-teal-500/25 text-teal-300 border-teal-500/50' },
            jat_quota: { text: 'जाट OBC आरक्षण मांग (हरियाणा)', class: 'bg-yellow-500/25 text-yellow-300 border-yellow-500/50' },
            manipur_st_issue: { text: 'मैतेई ST दर्जा मांग (मणिपुर)', class: 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50' },
            judicial_subclassification: { text: 'SC/ST उप-वर्गीकरण (सुप्रीम कोर्ट फैसला)', class: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50' },
            pro_quota: { text: 'आरक्षण विस्तार पक्षधर', class: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
        };

        const badge = stanceBadges[quote.stance] || { text: quote.category, class: 'bg-slate-700 text-slate-300' };

        const shareText = `📌 *${quote.leader}* (${quote.state || 'भारत'} • ${quote.party} • ${quote.date})\n"${quote.quote}"\n\n📖 संदर्भ: ${quote.sourceRef}`;

        const isRahulGandhi = quote.stance === 'exceed_50_cap';

        return `
            <div class="quote-card ${isRahulGandhi ? 'bg-gradient-to-b from-slate-900 to-rose-950/40 border-2 border-rose-500/70 shadow-rose-950/50' : 'bg-slate-900/90 border border-slate-800'} rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-orange-500/60 transition-all">
                <div>
                    <!-- Recent or Era Badge Header -->
                    <div class="flex items-center justify-between gap-2 mb-3">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-950 text-orange-300 border border-slate-800 flex items-center gap-1">
                                📍 ${quote.state || 'भारत'}
                            </span>
                            <span class="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-950 text-slate-300 border border-slate-800">
                                🏛️ ${quote.party}
                            </span>
                        </div>
                        ${quote.isRecent ? '<span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-600/30 text-red-300 border border-red-500/50 pulse-badge">🔥 2023-24 बहस</span>' : '<span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-400">📜 ऐतिहासिक</span>'}
                    </div>

                    <!-- Header with Name, Role, and Date (Clean Icon Instead of Politician Photo) -->
                    <div class="flex items-start gap-3 mb-3.5">
                        <div class="w-11 h-11 rounded-2xl ${isRahulGandhi ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'} flex items-center justify-center flex-shrink-0 shadow-md">
                            <i data-lucide="message-square-quote" class="w-5 h-5"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-base md:text-lg font-bold text-white leading-tight">${quote.leader}</h3>
                            <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">${quote.role}</p>
                            <div class="mt-1">
                                <span class="px-2 py-0.5 text-[11px] font-bold font-mono rounded bg-slate-950 text-amber-400 border border-slate-800">
                                    🗓️ ${quote.date}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Topic / Category Badge -->
                    <div class="mb-3">
                        <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.class}">
                            ${badge.text}
                        </span>
                    </div>

                    <!-- Context -->
                    <p class="text-xs text-slate-400 italic mb-2.5 flex items-start gap-1.5 leading-relaxed">
                        <i data-lucide="info" class="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5"></i>
                        <span>${quote.context}</span>
                    </p>

                    <!-- Quote Body -->
                    <blockquote class="text-slate-200 text-xs md:text-sm leading-relaxed relative pl-3.5 border-l-2 ${isRahulGandhi ? 'border-rose-500 bg-rose-950/30 text-rose-100' : 'border-orange-500/80 bg-slate-950/60'} my-3 font-medium p-3 rounded-r-xl">
                        "${quote.quote}"
                    </blockquote>
                </div>

                <!-- Footer Source & Actions -->
                <div class="pt-3.5 border-t border-slate-800 mt-3 flex items-center justify-between text-xs">
                    <span class="text-slate-400 truncate max-w-[170px]" title="${quote.sourceRef}">
                        📚 ${quote.sourceRef}
                    </span>
                    <div class="flex items-center gap-2">
                        <button onclick="copyToClipboard('${quote.quote.replace(/'/g, "\\'")}', 'बयान कॉपी हो गया!')" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="बयान कॉपी करें">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                        <button onclick="shareOnWhatsApp(decodeURIComponent('${encodeURIComponent(shareText)}'))" class="p-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1" title="व्हाट्सएप पर शेयर करें">
                            <i data-lucide="share-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   10. Slogans Showcase Rendering (आंदोलन के प्रमुख नारे)
   ========================================================================== */

function renderSlogans() {
    const container = document.getElementById('slogansContainer');
    const categoryContainer = document.getElementById('sloganCategoryButtons');
    const searchInput = document.getElementById('sloganSearchInput');
    if (!container) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = window.rhaState ? window.rhaState.selectedSloganCategory : 'all';

    // Render category buttons if not rendered
    if (categoryContainer && categoryContainer.children.length === 0) {
        const categories = ['all', ...new Set(RHA_DATA.slogans.map(s => s.category))];
        categoryContainer.innerHTML = categories.map(cat => `
            <button onclick="filterSlogansByCategory('${cat}')" class="slogan-cat-btn px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${cat === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}">
                ${cat === 'all' ? 'सभी नारे' : cat}
            </button>
        `).join('');
    }

    const filtered = RHA_DATA.slogans.filter(s => {
        const matchesQuery = query === '' || 
            s.text.toLowerCase().includes(query) || 
            s.english.toLowerCase().includes(query) ||
            s.category.toLowerCase().includes(query);
        const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
        return matchesQuery && matchesCat;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-slate-400">
                कोई नारा नहीं मिला।
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(slogan => {
        const shareText = `🔥 *आरक्षण हटाओ आंदोलन का सशक्त नारा:*\n\n"${slogan.text}"\n\n👉 *जाति नहीं, योग्यता को पहचानो!* #ReservationHatao #RHA`;
        return `
            <div class="slogan-card bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-orange-500/60 transition-all">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="px-3 py-1 text-xs font-bold rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                            🏷️ ${slogan.category}
                        </span>
                        ${slogan.highlight ? '<span class="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">⭐ लोकप्रिय</span>' : ''}
                    </div>
                    
                    <h3 class="text-lg md:text-xl font-bold text-white mb-2 leading-snug">
                        "${slogan.text}"
                    </h3>
                    
                    <p class="text-xs text-slate-400 font-mono mb-4 italic">
                        ${slogan.english}
                    </p>
                </div>

                <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <button onclick="copyToClipboard('${slogan.text.replace(/'/g, "\\'")}', 'नारा कॉपी हो गया!')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                        <span>कॉपी करें</span>
                    </button>

                    <button onclick="shareOnWhatsApp(decodeURIComponent('${encodeURIComponent(shareText)}'))" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                        <span>WhatsApp</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

window.filterSlogansByCategory = function(category) {
    if (window.rhaState) window.rhaState.selectedSloganCategory = category;
    const buttons = document.querySelectorAll('.slogan-cat-btn');
    buttons.forEach(btn => {
        if ((category === 'all' && btn.textContent.includes('सभी')) || btn.textContent.trim() === category) {
            btn.className = 'slogan-cat-btn px-4 py-1.5 rounded-full text-xs font-semibold transition-all bg-orange-500 text-white';
        } else {
            btn.className = 'slogan-cat-btn px-4 py-1.5 rounded-full text-xs font-semibold transition-all bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700';
        }
    });
    renderSlogans();
};

window.setQuoteEra = function(era) {
    if (window.rhaState) window.rhaState.quoteFilterEra = era;
    const buttons = document.querySelectorAll('.era-filter-btn');
    buttons.forEach(btn => {
        const btnEra = btn.getAttribute('data-era');
        if (btnEra === era) {
            btn.className = 'era-filter-btn px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all bg-orange-500 text-white shadow-lg shadow-orange-500/20';
        } else {
            btn.className = 'era-filter-btn px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all bg-slate-950 text-slate-300 hover:bg-slate-700 border border-slate-800';
        }
    });
    renderLeaderQuotes();
};

/* ==========================================================================
   11. Facts vs Myths Accordion (तथ्य बनाम भ्रम)
   ========================================================================== */

function renderMythsVsFacts() {
    const container = document.getElementById('mythsVsFactsContainer');
    if (!container) return;

    container.innerHTML = RHA_DATA.mythsVsFacts.map((item, index) => `
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all">
            <div class="flex items-start gap-3 mb-3">
                <span class="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-sm">
                    भ्रम
                </span>
                <h4 class="text-base md:text-lg font-bold text-red-200">
                    "${item.myth}"
                </h4>
            </div>

            <div class="flex items-start gap-3 pl-2 md:pl-4 border-l-2 border-emerald-500/60 ml-4 py-1">
                <span class="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">
                    सत्य
                </span>
                <div>
                    <p class="text-slate-200 text-sm md:text-base leading-relaxed">
                        ${item.fact}
                    </p>
                    <p class="text-xs text-slate-400 mt-2 font-mono">
                        📖 प्रामाणिक स्रोत: ${item.reference}
                    </p>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   12. Search and Filter Event Listeners
   ========================================================================== */

function initSearchAndFilters() {
    // Leader Quotes Search and Filter
    const quoteSearch = document.getElementById('leaderQuoteSearch');
    const quoteStance = document.getElementById('leaderStanceFilter');
    const quoteState = document.getElementById('leaderStateFilter');

    if (quoteSearch) {
        quoteSearch.addEventListener('input', () => renderLeaderQuotes());
    }
    if (quoteStance) {
        quoteStance.addEventListener('change', () => renderLeaderQuotes());
    }
    if (quoteState) {
        quoteState.addEventListener('change', () => renderLeaderQuotes());
    }

    // Slogans Search
    const sloganSearch = document.getElementById('sloganSearchInput');
    if (sloganSearch) {
        sloganSearch.addEventListener('input', () => renderSlogans());
    }

    // Timeline Category Filter Buttons
    const timelineFilterBtns = document.querySelectorAll('.timeline-filter-btn');
    timelineFilterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            timelineFilterBtns.forEach(b => {
                b.className = 'timeline-filter-btn px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700';
            });
            e.currentTarget.className = 'timeline-filter-btn px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all bg-orange-500 text-white border border-orange-400';
            const filterType = e.currentTarget.getAttribute('data-filter') || 'all';
            renderTimeline(filterType);
        });
    });
}

/* ==========================================================================
   13. Community Logs & Wall of Warriors (આંદોલન દૈનિક ડાયરી અને યોદ્ધા દીવાલ)
   ========================================================================== */

window.filterDailyLogByDate = function(dateId) {
    if (window.rhaState) {
        window.rhaState.selectedDailyLogDate = dateId;
    }
    renderCommunityLogs(dateId);
};

window.openImageViewer = function(imageSrc, imageTitle = 'સત્યાગ્રહી યોદ્ધા પ્રમાણપત્ર') {
    let modal = document.getElementById('imageViewerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageViewerModal';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 transition-all opacity-0 pointer-events-none';
        modal.innerHTML = `
            <div class="relative max-w-3xl w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
                <div class="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <h4 id="imageViewerTitle" class="text-sm md:text-base font-bold text-white flex items-center gap-2">
                        <i data-lucide="award" class="w-4 h-4 text-pink-400"></i>
                        <span></span>
                    </h4>
                    <button onclick="window.closeImageViewer()" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="max-h-[75vh] overflow-auto rounded-2xl flex items-center justify-center bg-black/40 w-full p-2">
                    <img id="imageViewerImg" src="" alt="Proof Screenshot" class="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalImg = document.getElementById('imageViewerImg');
    const modalTitle = document.getElementById('imageViewerTitle');
    if (modalImg) modalImg.src = imageSrc;
    if (modalTitle) modalTitle.querySelector('span').innerText = imageTitle;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    if (window.lucide) lucide.createIcons();
};

window.closeImageViewer = function() {
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
};

function renderCommunityLogs(selectedDate = null) {
    const tabsContainer = document.getElementById('dailyLogDateTabs');
    const container = document.getElementById('dailyLogContainer');
    if (!container) return;

    const logs = (typeof RHA_DATA !== 'undefined' && RHA_DATA.dailyLogs) ? RHA_DATA.dailyLogs : [];
    if (logs.length === 0) return;

    const activeDate = selectedDate || (window.rhaState && window.rhaState.selectedDailyLogDate) || 'all';

    // 1. Render Date Tabs
    if (tabsContainer) {
        let tabsHtml = `
            <button onclick="filterDailyLogByDate('all')" class="daily-tab-btn px-4 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all ${activeDate === 'all' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}">
                📅 સંપૂર્ણ ઈતિહાસ
            </button>
        `;

        logs.forEach(log => {
            const isCurrent = activeDate === log.dateId;
            tabsHtml += `
                <button onclick="filterDailyLogByDate('${log.dateId}')" class="daily-tab-btn px-4 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all ${isCurrent ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}">
                    ⭐ ${log.dayNumber}: ${log.date}
                </button>
            `;
        });
        tabsContainer.innerHTML = tabsHtml;
    }

    // 2. Filter Logs
    const displayLogs = activeDate === 'all' ? logs : logs.filter(l => l.dateId === activeDate);

    // 3. Render Each Day's Section
    container.innerHTML = displayLogs.map(log => {
        // Screenshots Grid HTML
        const screenshotsHtml = (log.warriorScreenshots || []).map(sc => {
            const boastText = `🌟 *आरक्षण हटाओ आंदोलन (RHA) की योद्धा दीवार:* \n\n📸 *${sc.title}*\n🎖️ સન્માન: *${sc.badge}*\n💬 ${sc.caption}\n\n👉 *જાતિ નહીં, યોગ્યતાને ઓળખો! પ્રતિભાને તેનો હક અપાવો!*\n\n🔗 લાઈવ યોદ્ધા દીવાલ જુઓ:\nhttps://rhaindia.me/#community-log`;
            const imgSrc = encodeURI(sc.image);
            return `
                <div class="warrior-screenshot-card bg-slate-900/90 border border-slate-800 hover:border-pink-500/60 rounded-3xl p-4 shadow-xl transition-all flex flex-col justify-between group">
                    <div>
                        <!-- Screenshot Image with Click to Zoom -->
                        <div class="relative overflow-hidden rounded-2xl bg-black/60 mb-4 aspect-[4/5] flex items-center justify-center border border-slate-800 cursor-pointer" onclick="openImageViewer('${imgSrc}', '${sc.title} - ${sc.badge}')">
                            <img src="${imgSrc}" alt="${sc.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                                <span class="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-600 text-white shadow-md flex items-center gap-1">
                                    <i data-lucide="zoom-in" class="w-3 h-3"></i>
                                    <span>મોટો ફોટો જુઓ</span>
                                </span>
                            </div>
                        </div>

                        <!-- Card Details -->
                        <div class="space-y-1.5 mb-3">
                            <div class="flex items-center justify-between gap-1 flex-wrap">
                                <h4 class="text-base font-black text-white group-hover:text-pink-300 transition-colors">${sc.title}</h4>
                                <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    ${sc.badge}
                                </span>
                            </div>
                            <p class="text-xs text-slate-300 leading-relaxed">${sc.caption}</p>
                        </div>
                    </div>

                    <!-- Card Actions -->
                    <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span class="text-[11px] font-mono text-slate-400">
                            📅 ${sc.date}
                        </span>
                        <button onclick="shareOnWhatsApp(decodeURIComponent('${encodeURIComponent(boastText)}'))" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5" title="WhatsApp પર શેર કરો">
                            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                            <span>શેર કરો</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Highlights List
        const highlightsHtml = (log.highlights || []).map(h => `
            <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <span class="text-emerald-400 font-bold">✔</span>
                <span>${h}</span>
            </li>
        `).join('');

        return `
            <div class="day-log-card bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                
                <!-- Day Header & Highlights -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-2 border border-rose-500/40">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                            <span>${log.dayNumber} — ${log.date}</span>
                        </div>
                        <h3 class="text-2xl font-black text-white">${log.headline}</h3>
                        <p class="text-xs md:text-sm text-slate-400 mt-1">
                            🏆 મુખ્ય સિદ્ધિ: <strong class="text-slate-200">${log.milestone}</strong>
                        </p>
                    </div>

                    <!-- Daily Stat Counters -->
                    <div class="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
                        <div class="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="block text-lg sm:text-xl font-black text-orange-400">${log.views}</span>
                            <span class="text-[10px] font-bold text-slate-400">વેબસાઇટ Views</span>
                        </div>
                        <div class="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="block text-lg sm:text-xl font-black text-emerald-400">${log.activeUsers}</span>
                            <span class="text-[10px] font-bold text-slate-400">સક્રિય વિદ્યાર્થીઓ</span>
                        </div>
                        <div class="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="block text-lg sm:text-xl font-black text-pink-400">${log.instagramNewMembers}</span>
                            <span class="text-[10px] font-bold text-slate-400">Instagram યોદ્ધા</span>
                        </div>
                    </div>
                </div>

                <!-- Daily Slogan Quote Banner -->
                <div class="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-transparent border-l-4 border-orange-500 flex items-center gap-3">
                    <i data-lucide="flame" class="w-5 h-5 text-orange-400 shrink-0"></i>
                    <span class="text-xs sm:text-sm font-bold text-slate-200">
                        "${log.sloganOfTheDay}"
                    </span>
                </div>

                <!-- Verified Highlights Box -->
                ${highlightsHtml ? `
                    <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
                            <span>પ્રમાણિત દૈનિક સિદ્ધિઓ (Verified Records):</span>
                        </h4>
                        <ul class="space-y-1.5">
                            ${highlightsHtml}
                        </ul>
                    </div>
                ` : ''}

                <!-- Section: Warrior Screenshots Gallery -->
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-base font-black text-white flex items-center gap-2">
                            <i data-lucide="award" class="w-4 h-4 text-pink-400"></i>
                            <span>જોડાયેલા સત્યાગ્રહી યોદ્ધાઓના પ્રમાણિત સ્ક્રીનશોટ્સ (Wall of Honor Gallery)</span>
                        </h4>
                        <span class="text-xs text-slate-400 font-mono">
                            ${(log.warriorScreenshots || []).length} પ્રમાણપત્ર લાઈવ
                        </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        ${screenshotsHtml}
                    </div>
                </div>

            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}
