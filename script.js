document.addEventListener('DOMContentLoaded', function() {
    // Wedding expense categories with default percentages for different styles
    const weddingCategories = {
        budget: [
            { name: "Venue & Catering", percentage: 40 },
            { name: "Decoration & Flowers", percentage: 10 },
            { name: "Bride & Groom Attire", percentage: 15 },
            { name: "Photography & Videography", percentage: 10 },
            { name: "Music & Entertainment", percentage: 5 },
            { name: "Invitations & Stationery", percentage: 3 },
            { name: "Wedding Rings", percentage: 5 },
            { name: "Transportation", percentage: 2 },
            { name: "Gifts & Favors", percentage: 3 },
            { name: "Makeup & Hair", percentage: 4 },
            { name: "Miscellaneous", percentage: 3 }
        ],
        midrange: [
            { name: "Venue & Catering", percentage: 35 },
            { name: "Decoration & Flowers", percentage: 12 },
            { name: "Bride & Groom Attire", percentage: 15 },
            { name: "Photography & Videography", percentage: 12 },
            { name: "Music & Entertainment", percentage: 7 },
            { name: "Invitations & Stationery", percentage: 4 },
            { name: "Wedding Rings", percentage: 5 },
            { name: "Transportation", percentage: 3 },
            { name: "Gifts & Favors", percentage: 3 },
            { name: "Makeup & Hair", percentage: 3 },
            { name: "Miscellaneous", percentage: 1 }
        ],
        luxury: [
            { name: "Venue & Catering", percentage: 30 },
            { name: "Decoration & Flowers", percentage: 15 },
            { name: "Bride & Groom Attire", percentage: 12 },
            { name: "Photography & Videography", percentage: 10 },
            { name: "Music & Entertainment", percentage: 10 },
            { name: "Invitations & Stationery", percentage: 5 },
            { name: "Wedding Rings", percentage: 7 },
            { name: "Transportation", percentage: 4 },
            { name: "Gifts & Favors", percentage: 3 },
            { name: "Makeup & Hair", percentage: 3 },
            { name: "Miscellaneous", percentage: 1 }
        ]
    };

    // DOM Elements
    const totalBudgetInput = document.getElementById('totalBudget');
    const calculateBtn = document.getElementById('calculateBtn');
    const budgetBreakdown = document.getElementById('budgetBreakdown');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const allocatedBudgetElement = document.getElementById('allocatedBudget');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const printBtn = document.getElementById('printBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const styleButtons = document.querySelectorAll('.style-btn');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const faqQuestions = document.querySelectorAll('.faq-question');
    const shareButtons = document.querySelectorAll('.share-btn');

    // Chart elements
    const pieChartCanvas = document.getElementById('budgetPieChart');
    const barChartCanvas = document.getElementById('budgetBarChart');
    
    // Chart instances
    let pieChart = null;
    let barChart = null;

    // Current wedding style
    let currentStyle = 'budget';
    let totalBudget = 0;
    let categories = [];

    // Mobile navigation toggle
    hamburgerMenu.addEventListener('click', function() {
        hamburgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburgerMenu.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // FAQ accordion functionality
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // Format currency in Indian Rupees
    function formatCurrency(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    }

    // Initialize style buttons
    styleButtons.forEach(button => {
        button.addEventListener('click', function() {
            styleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentStyle = this.dataset.style;
            
            // If budget is already calculated, update the breakdown
            if (totalBudget > 0) {
                calculateBudgetBreakdown();
            }
        });
    });

    // Calculate budget breakdown
    calculateBtn.addEventListener('click', function() {
        totalBudget = parseFloat(totalBudgetInput.value);
        
        if (isNaN(totalBudget) || totalBudget <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }
        
        calculateBudgetBreakdown();
        budgetBreakdown.style.display = 'block';
        
        // Scroll to budget breakdown section
        budgetBreakdown.scrollIntoView({ behavior: 'smooth' });
    });

    // Calculate and display budget breakdown
    function calculateBudgetBreakdown() {
        categoriesContainer.innerHTML = '';
        categories = JSON.parse(JSON.stringify(weddingCategories[currentStyle]));
        
        // Create sliders for each category
        categories.forEach((category, index) => {
            const categoryAmount = (totalBudget * category.percentage) / 100;
            
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            
            const categoryName = document.createElement('div');
            categoryName.className = 'category-name';
            categoryName.textContent = category.name;
            
            const categoryAmountElement = document.createElement('div');
            categoryAmountElement.className = 'category-amount';
            categoryAmountElement.textContent = formatCurrency(categoryAmount);
            categoryAmountElement.id = `amount-${index}`;
            
            categoryHeader.appendChild(categoryName);
            categoryHeader.appendChild(categoryAmountElement);
            
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '100';
            slider.value = category.percentage;
            slider.className = 'slider';
            slider.id = `slider-${index}`;
            
            const percentageElement = document.createElement('span');
            percentageElement.className = 'percentage';
            percentageElement.textContent = `${category.percentage}%`;
            percentageElement.id = `percentage-${index}`;
            
            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(percentageElement);
            
            categoryItem.appendChild(categoryHeader);
            categoryItem.appendChild(sliderContainer);
            
            categoriesContainer.appendChild(categoryItem);
            
            // Add event listener to slider
            slider.addEventListener('input', function() {
                updateCategoryPercentage(index, parseInt(this.value));
            });
        });
        
        updateSummary();
        updateCharts();
    }

    // Update category percentage when slider is moved
    function updateCategoryPercentage(index, newPercentage) {
        categories[index].percentage = newPercentage;
        
        const categoryAmount = (totalBudget * newPercentage) / 100;
        document.getElementById(`amount-${index}`).textContent = formatCurrency(categoryAmount);
        document.getElementById(`percentage-${index}`).textContent = `${newPercentage}%`;
        
        updateSummary();
        updateCharts();
    }

    // Update budget summary
    function updateSummary() {
        const totalAllocated = categories.reduce((sum, category) => {
            return sum + (totalBudget * category.percentage) / 100;
        }, 0);
        
        const remaining = totalBudget - totalAllocated;
        
        allocatedBudgetElement.textContent = formatCurrency(totalAllocated);
        remainingBudgetElement.textContent = formatCurrency(remaining);
        
        // Change color based on remaining budget
        if (remaining < 0) {
            remainingBudgetElement.style.color = 'red';
        } else {
            remainingBudgetElement.style.color = 'green';
        }
    }

    // Create and update charts
    function updateCharts() {
        const categoryNames = categories.map(category => category.name);
        const categoryAmounts = categories.map(category => (totalBudget * category.percentage) / 100);
        const categoryPercentages = categories.map(category => category.percentage);
        
        // Generate colors for chart segments
        const backgroundColors = generateChartColors(categories.length);
        
        // Update or create pie chart
        if (pieChart) {
            pieChart.data.labels = categoryNames;
            pieChart.data.datasets[0].data = categoryPercentages;
            pieChart.update();
        } else {
            pieChart = new Chart(pieChartCanvas, {
                type: 'pie',
                data: {
                    labels: categoryNames,
                    datasets: [{
                        data: categoryPercentages,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    family: 'Poppins'
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Budget Allocation by Percentage',
                            font: {
                                family: 'Poppins',
                                size: 16
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Update or create bar chart
        if (barChart) {
            barChart.data.labels = categoryNames;
            barChart.data.datasets[0].data = categoryAmounts;
            barChart.update();
        } else {
            barChart = new Chart(barChartCanvas, {
                type: 'bar',
                data: {
                    labels: categoryNames,
                    datasets: [{
                        label: 'Amount (₹)',
                        data: categoryAmounts,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Budget Allocation by Amount',
                            font: {
                                family: 'Poppins',
                                size: 16
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return formatCurrency(context.raw);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value.toLocaleString('en-IN');
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Generate colors for chart
    function generateChartColors(count) {
        const baseColors = [
            '#D4145A', // Primary color
            '#D4AF37', // Secondary color
            '#FF6B6B',
            '#4ECDC4',
            '#556270',
            '#C7F464',
            '#FF8C94',
            '#9B59B6',
            '#3498DB',
            '#2ECC71',
            '#F1C40F'
        ];
        
        // If we have more categories than base colors, generate additional colors
        if (count <= baseColors.length) {
            return baseColors.slice(0, count);
        } else {
            const colors = [...baseColors];
            for (let i = baseColors.length; i < count; i++) {
                const hue = (i * 137) % 360; // Golden ratio to spread colors evenly
                colors.push(`hsl(${hue}, 70%, 60%)`);
            }
            return colors;
        }
    }

    // Share functionality
    document.getElementById('whatsappShareBtn').addEventListener('click', function() {
        const text = `Check out my Indian Wedding Budget Plan: Total Budget: ${formatCurrency(totalBudget)}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });

    document.getElementById('emailShareBtn').addEventListener('click', function() {
        let emailBody = `My Indian Wedding Budget Plan:\n\n`;
        emailBody += `Total Budget: ${formatCurrency(totalBudget)}\n\n`;
        emailBody += `Budget Breakdown:\n`;
        
        categories.forEach(category => {
            const amount = (totalBudget * category.percentage) / 100;
            emailBody += `${category.name}: ${formatCurrency(amount)} (${category.percentage}%)\n`;
        });
        
        const subject = 'My Indian Wedding Budget Plan';
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    });

    document.getElementById('facebookShareBtn').addEventListener('click', function() {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    });

    document.getElementById('twitterShareBtn').addEventListener('click', function() {
        const text = `Planning my Indian wedding with this amazing budget calculator! Total budget: ${formatCurrency(totalBudget)}`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    });

    // Print budget plan
    printBtn.addEventListener('click', function() {
        window.print();
    });

    // Download as PDF
    downloadBtn.addEventListener('click', function() {
        const element = document.querySelector('.container');
        const opt = {
            margin: 10,
            filename: 'Indian_Wedding_Budget_Plan.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Use html2pdf library
        html2pdf().set(opt).from(element).save();
    });

    // Reset calculator
    resetBtn.addEventListener('click', function() {
        totalBudgetInput.value = '';
        budgetBreakdown.style.display = 'none';
        totalBudget = 0;
        
        // Reset style to budget
        styleButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-style="budget"]').classList.add('active');
        currentStyle = 'budget';
        
        // Reset charts
        if (pieChart) {
            pieChart.destroy();
            pieChart = null;
        }
        
        if (barChart) {
            barChart.destroy();
            barChart = null;
        }
        
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}); 