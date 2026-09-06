import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import FoodImage from '../../components/FoodImage';

const STEPS = ['base', 'sauce', 'cheese', 'vegetable', 'drink', 'dessert'];
const STEP_LABELS = {
  base: 'Step 1: Choose a Base',
  sauce: 'Step 2: Choose a Sauce',
  cheese: 'Step 3: Choose a Cheese',
  vegetable: 'Step 4: Choose Vegetables (multi-select)',
  drink: 'Step 5: Add a Drink (optional)',
  dessert: 'Step 6: Add a Dessert (optional)',
};
const PRICE_PER_PIZZA = 249;

const PizzaBuilder = () => {
  const [options, setOptions] = useState({ base: [], sauce: [], cheese: [], vegetable: [], drink: [], dessert: [] });
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState({
    base: '', sauce: '', cheese: '', vegetables: [], drink: null, dessert: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/inventory/public').then(({ data }) => setOptions(data));
  }, []);

  const currentKey = STEPS[step];
  const isMenuStep = currentKey === 'drink' || currentKey === 'dessert';

  const selectSingle = (item) => {
    if (currentKey === 'vegetable') return;
    if (isMenuStep) {
      setSelection((s) => ({ ...s, [currentKey]: s[currentKey]?.name === item.name ? null : item }));
      return;
    }
    setSelection((s) => ({ ...s, [currentKey]: item.name }));
  };

  const toggleVegetable = (veg) => {
    setSelection((s) => ({
      ...s,
      vegetables: s.vegetables.includes(veg)
        ? s.vegetables.filter((v) => v !== veg)
        : [...s.vegetables, veg],
    }));
  };

  const canProceed =
    currentKey === 'vegetable' || isMenuStep ? true : Boolean(selection[currentKey]);

  const buildExtras = () => {
    const extras = [];
    if (selection.drink) extras.push({ category: 'drink', name: selection.drink.name, price: selection.drink.price });
    if (selection.dessert) extras.push({ category: 'dessert', name: selection.dessert.name, price: selection.dessert.price });
    return extras;
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const extras = buildExtras();
      const extrasTotal = extras.reduce((sum, e) => sum + (e.price || 0), 0);
      navigate('/order-summary', {
        state: {
          pizza: { base: selection.base, sauce: selection.sauce, cheese: selection.cheese, vegetables: selection.vegetables },
          extras,
          totalAmount: PRICE_PER_PIZZA + extrasTotal,
        },
      });
    }
  };

  return (
    <div className="page">
      <div className="builder-header">
        <span className="step-pill">{step + 1} / {STEPS.length}</span>
        <h1>{STEP_LABELS[currentKey]}</h1>
      </div>

      <div className="options-grid">
        {(options[currentKey] || []).map((opt) => {
          const isSelected =
            currentKey === 'vegetable'
              ? selection.vegetables.includes(opt.name)
              : isMenuStep
              ? selection[currentKey]?.name === opt.name
              : selection[currentKey] === opt.name;
          return (
            <button
              key={opt.name}
              className={`option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => (currentKey === 'vegetable' ? toggleVegetable(opt.name) : selectSingle(opt))}
            >
              <FoodImage query={opt.imageQuery || opt.name} fallbackEmoji={opt.emoji || '🍕'} size={110} className="option-img" />
              <span className="option-name">{opt.name}</span>
              {opt.price ? <span className="option-price">+₹{opt.price}</span> : null}
            </button>
          );
        })}
        {(options[currentKey] || []).length === 0 && isMenuStep && (
          <p className="muted">No items available right now — you can skip this step.</p>
        )}
      </div>

      <div className="step-nav">
        {step > 0 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
        <button className="btn-primary" disabled={!canProceed} onClick={next}>
          {step === STEPS.length - 1 ? 'Review Order' : isMenuStep ? 'Skip / Next' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default PizzaBuilder;