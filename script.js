document.addEventListener('DOMContentLoaded', () => {
    const csvFile = document.getElementById('csvFile');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const reportResultDiv = document.getElementById('reportResult');
    const reportContentDiv = document.getElementById('reportContent');
    const downloadReportBtn = document.getElementById('downloadReportBtn');

    let currentReportText = ''; // Для зберігання тексту звіту для завантаження

    generateReportBtn.addEventListener('click', () => {
        const file = csvFile.files[0];
        if (!file) {
            alert('Будь ласка, завантажте CSV-файл.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            processCSV(text);
        };
        reader.readAsText(file);
    });

    function processCSV(csvString) {
        const lines = csvString.split('\n');
        let totalIncome = 0;
        let totalExpenses = 0;
        const transactions = [];

        // Пропускаємо заголовок, якщо він є
        let dataLines = lines;
        if (lines[0].toLowerCase().includes('дата') || lines[0].toLowerCase().includes('сума') || lines[0].toLowerCase().includes('опис')) {
            dataLines = lines.slice(1); // Пропустити першу лінію (заголовок)
        }

        dataLines.forEach(line => {
            const parts = line.split(';'); // Або ',' в залежності від формату CSV
            if (parts.length >= 2) { // Перевірка на мінімальну кількість колонок
                const amountStr = parts[1] ? parts[1].replace(',', '.').trim() : '0'; // Замінюємо кому на крапку
                const amount = parseFloat(amountStr);
                const description = parts[2] ? parts[2].trim() : ''; // Опис транзакції

                if (!isNaN(amount)) {
                    if (amount > 0) {
                        totalIncome += amount;
                    } else {
                        totalExpenses += Math.abs(amount); // Витрати завжди додатні
                    }
                    transactions.push({ amount, description });
                }
            }
        });

        const netProfit = totalIncome - totalExpenses;
        const singleTax = totalIncome * 0.05; // Єдиний податок 5% від доходу

        // Імітація AI-коментаря
        const aiComment = `
            Витрати включають регулярні платежі за [наприклад, оренду, інтернет], що є звичайною частиною ведення бізнесу.
            Загалом, ваші фінанси стабільні, але варто переглянути категорії витрат, щоб знайти можливості для оптимізації. Наприклад, чи є підписки, якими ви більше не користуєтеся?
        `;

        currentReportText = `
            **Звіт ФОП за період**

            **Надходження (дохід):** ${totalIncome.toFixed(2)} грн
            **Витрати:** ${totalExpenses.toFixed(2)} грн
            **Чистий прибуток:** ${netProfit.toFixed(2)} грн

            **Єдиний податок (5% від доходу):** ${singleTax.toFixed(2)} грн

            **Коментар AI-асистента Zvit:**
            ${aiComment.trim()}
        `;

        reportContentDiv.innerHTML = formatReport(currentReportText);
        reportResultDiv.style.display = 'block';
    }

    function formatReport(text) {
        // Проста функція для форматування тексту, щоб відображати жирний шрифт
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<p>');
    }

    downloadReportBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Додаємо український шрифт (не всі шрифти підтримуються у jspdf за замовчуванням)
        // Для спрощення, використовуємо стандартний шрифт.
        // Якщо потрібно повну підтримку кирилиці, треба вбудовувати шрифт, що складніше для MVP.
        doc.setFont("Helvetica"); // Використання стандартного шрифту

        const lines = currentReportText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let y = 20;
        const lineHeight = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        doc.setFontSize(16);
        doc.text("Zvit - Ваш AI-бухгалтер", pageWidth / 2, y, { align: 'center' });
        y += lineHeight * 2;

        doc.setFontSize(12);
        lines.forEach(line => {
            const splitText = doc.splitTextToSize(line.replace(/\*\*(.*?)\*\*/g, '$1'), pageWidth - 2 * margin);
            doc.text(splitText, margin, y);
            y += splitText.length * lineHeight;
        });

        doc.save('Zvit_financial_report.pdf');
    });

    // Підключаємо бібліотеку jspdf для генерації PDF
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
});