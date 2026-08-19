import { analyzeDataArray } from './dataProcessor';
import { DatasetAnalysis } from './types';

export const SAMPLE_DATASETS = [
  {
    id: 'ecommerce',
    name: '🛍️ E-Commerce Global Sales (2024)',
    description: '100+ transactions with Product Categories, Revenue, Quantity, Region, Customer Rating & Profit Margin.',
    generate: () => {
      const categories = ['Electronics', 'Fashion & Apparel', 'Home & Kitchen', 'Books & Stationery', 'Fitness & Outdoor'];
      const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
      const payments = ['Credit Card', 'PayPal', 'Apple Pay', 'Bank Transfer'];

      const rows: Record<string, any>[] = [];
      const baseDate = new Date('2024-01-01');

      for (let i = 1; i <= 120; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const reg = regions[Math.floor(Math.random() * regions.length)];
        const qty = Math.floor(Math.random() * 10) + 1;
        const unitPrice = cat === 'Electronics' ? Math.floor(Math.random() * 800) + 150 : Math.floor(Math.random() * 120) + 15;
        const revenue = qty * unitPrice;
        const marginPct = (Math.random() * 0.35 + 0.15);
        const profit = Math.round(revenue * marginPct);
        const rating = Number((Math.random() * 2 + 3).toFixed(1));
        const orderDate = new Date(baseDate.getTime() + i * 86400000 * 2.5).toISOString().split('T')[0];

        rows.push({
          OrderID: `ORD-${1000 + i}`,
          Date: orderDate,
          Category: cat,
          Region: reg,
          Quantity: qty,
          UnitPrice: unitPrice,
          Revenue: revenue,
          Profit: profit,
          PaymentMethod: payments[Math.floor(Math.random() * payments.length)],
          CustomerRating: rating
        });
      }

      return analyzeDataArray(rows, 'ecommerce_global_sales_2024.csv', '24.5 KB');
    }
  },
  {
    id: 'tech_salaries',
    name: '💻 Tech Industry Compensation & Roles',
    description: 'Salary distribution across Job Titles, Experience Levels, Remote Work ratios & Locations.',
    generate: () => {
      const titles = ['Data Scientist', 'AI Engineer', 'Frontend Developer', 'Product Manager', 'Cloud Architect', 'DevOps Specialist'];
      const expLevels = ['Entry', 'Mid-Level', 'Senior', 'Lead/Principal'];
      const countries = ['United States', 'Germany', 'United Kingdom', 'Canada', 'India', 'Singapore'];

      const rows: Record<string, any>[] = [];
      for (let i = 1; i <= 100; i++) {
        const title = titles[Math.floor(Math.random() * titles.length)];
        const exp = expLevels[Math.floor(Math.random() * expLevels.length)];
        const expMultiplier = exp === 'Entry' ? 0.7 : exp === 'Mid-Level' ? 1.0 : exp === 'Senior' ? 1.4 : 1.8;
        const base = title.includes('AI') ? 140000 : title.includes('Cloud') ? 130000 : 110000;
        const salary = Math.round(base * expMultiplier + (Math.random() * 20000 - 10000));
        const remoteRatio = [0, 50, 100][Math.floor(Math.random() * 3)];
        const bonus = Math.round(salary * (Math.random() * 0.2));

        rows.push({
          EmpID: `EMP-${500 + i}`,
          JobTitle: title,
          ExperienceLevel: exp,
          BaseSalaryUSD: salary,
          AnnualBonusUSD: bonus,
          RemotePercentage: remoteRatio,
          Country: countries[Math.floor(Math.random() * countries.length)],
          YearsExperience: exp === 'Entry' ? Math.floor(Math.random() * 2) + 1 : exp === 'Senior' ? Math.floor(Math.random() * 5) + 5 : 3
        });
      }

      return analyzeDataArray(rows, 'tech_compensation_2024.csv', '18.2 KB');
    }
  },
  {
    id: 'saas_metrics',
    name: '🚀 SaaS Business Performance & Churn',
    description: 'Monthly Recurring Revenue (MRR), Customer Lifetime Value (LTV), Churn Rates & Acquisition Channels.',
    generate: () => {
      const channels = ['SEO & Organic', 'Google Ads', 'LinkedIn Ads', 'Referral', 'Direct Sales'];
      const plans = ['Starter', 'Professional', 'Enterprise'];

      const rows: Record<string, any>[] = [];
      for (let i = 1; i <= 90; i++) {
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const mrr = plan === 'Starter' ? 49 : plan === 'Professional' ? 199 : 899;
        const activeUsers = plan === 'Starter' ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 50) + 10;
        const netPromoterScore = Math.floor(Math.random() * 5) + 6;
        const churned = Math.random() < 0.12 ? 'Yes' : 'No';
        const LTV = Math.round(mrr * (churned === 'Yes' ? 8 : 28));

        rows.push({
          AccountID: `ACC-${3000 + i}`,
          PlanType: plan,
          AcquisitionChannel: channels[Math.floor(Math.random() * channels.length)],
          MonthlyRevenue: mrr,
          ActiveSeats: activeUsers,
          NPS_Score: netPromoterScore,
          CustomerLTV: LTV,
          IsChurned: churned
        });
      }

      return analyzeDataArray(rows, 'saas_metrics_dashboard.json', '15.8 KB');
    }
  }
];
