document.addEventListener('DOMContentLoaded', () => {
    const csvFile = document.getElementById('csvFile');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const reportResultDiv = document.getElementById('reportResult');
    const reportContentDiv = document.getElementById('reportContent');
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    const sendToTaxBtn = document.getElementById('sendToTaxBtn'); // Нова кнопка

    let currentReportText = ''; // Для зберігання тексту звіту для завантаження

    // Додаємо стиль для нової кнопки (додай це до style.css)
    /*
    .report-actions {
        display: flex;
        justify-content: center;
        gap: 15px; /* Простір між кнопками */
        margin-top: 25px;
    }

    .secondary-button {
        background-color: #3498db; /* Синій колір */
    }

    .secondary-button:hover {
        background-color: #2980b9;
    }
    */


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

    function detectDelimiter(text) {
        // Проста функція для визначення роздільника
        return text.includes(';') ? ';' : ',';
    }

    function processCSV(csvString) {
        const lines = csvString.split('\n').filter(line => line.trim() !== ''); // Видаляємо порожні рядки
        let totalIncome = 0;
        let totalExpenses = 0;

        if (lines.length === 0) {
            alert('Файл CSV порожній або містить недійсні дані.');
            reportResultDiv.style.display = 'none';
            return;
        }

        const delimiter = detectDelimiter(lines[0]); // Визначаємо роздільник з першого рядка

        // Пропускаємо заголовок, якщо він є і містить типові ключові слова
        let dataLines = lines;
        const firstLineLower = lines[0].toLowerCase();
        if (firstLineLower.includes('дата') || firstLineLower.includes('сума') || firstLineLower.includes('опис') || firstLineLower.includes('amount') || firstLineLower.includes('description')) {
            dataLines = lines.slice(1);
        }

        dataLines.forEach(line => {
            const parts = line.split(delimiter);
            if (parts.length >= 2) { // Припускаємо, що сума знаходиться у другій колонці (індекс 1)
                let amountStr = parts[1] ? parts[1].trim() : '0';
                
                // Нормалізуємо десятковий розділювач (замінюємо кому на крапку)
                amountStr = amountStr.replace(',', '.'); 
                
                // Видаляємо пробіли тисяч (якщо вони є)
                amountStr = amountStr.replace(/\s/g, '');

                const amount = parseFloat(amountStr);

                if (!isNaN(amount)) {
                    if (amount > 0) {
                        totalIncome += amount;
                    } else {
                        totalExpenses += Math.abs(amount); // Витрати завжди додатні
                    }
                }
            }
        });

        const netProfit = totalIncome - totalExpenses;
        const singleTax = totalIncome * 0.05; // Єдиний податок 5% від доходу

        // Імітація AI-коментаря
        const aiComment = `
            Витрати включають регулярні платежі за товари/послуги, оренду, інтернет. Це є звичайною частиною ведення бізнесу.
            Ваші фінанси виглядають стабільно, але завжди варто аналізувати категорії витрат, щоб знайти потенційні можливості для оптимізації. Розгляньте, чи всі підписки та сервіси використовуються на повну потужність.
            Цей звіт сформовано на основі наданих вами даних і може бути використаний для подачі до податкової служби.
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
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('\n').map(p => `<p>${p.trim()}</p>`).join('');
    }

    downloadReportBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("Helvetica"); 

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

    // Обробник для нової кнопки "Надіслати у податкову"
    sendToTaxBtn.addEventListener('click', () => {
        alert('Дякуємо! Ваш звіт успішно надіслано до податкової служби. (Це симуляція для MVP. Для реальної інтеграції потрібен бекенд та офіційні API ДПС).');
        // Можна додати іншу візуальну відповідь, наприклад, змінити текст кнопки або показати повідомлення на сторінці
    });


    // Підключаємо бібліотеку jspdf для генерації PDF
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
});
