const tokenPattern = /\s*(?:(\d+(?:\.\d+)?)|([A-Z][A-Z0-9_]*)|([()+\-*/]))/gy

function calculationError(message) {
  const error = new Error(message)
  error.statusCode = 422
  return error
}

function tokenize(formula) {
  const tokens = []
  let position = 0
  while (position < formula.length) {
    tokenPattern.lastIndex = position
    const match = tokenPattern.exec(formula)
    if (!match || match.index !== position) throw calculationError(`Invalid formula near: ${formula.slice(position)}`)
    tokens.push(match[1] ? Number(match[1]) : match[2] || match[3])
    position = tokenPattern.lastIndex
  }
  return tokens
}

function evaluateFormula(formula, values) {
  const output = []
  const operators = []
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 }
  for (const token of tokenize(formula)) {
    if (typeof token === 'number' || /^[A-Z]/.test(token)) output.push(typeof token === 'number' ? token : values[token] || 0)
    else if (token === '(') operators.push(token)
    else if (token === ')') {
      while (operators.at(-1) !== '(') {
        if (!operators.length) throw calculationError('Unbalanced parentheses in formula')
        output.push(operators.pop())
      }
      operators.pop()
    } else {
      while (operators.length && operators.at(-1) !== '(' && precedence[operators.at(-1)] >= precedence[token]) output.push(operators.pop())
      operators.push(token)
    }
  }
  while (operators.length) {
    const operator = operators.pop()
    if (operator === '(') throw calculationError('Unbalanced parentheses in formula')
    output.push(operator)
  }
  const stack = []
  for (const token of output) {
    if (typeof token === 'number') stack.push(token)
    else {
      const right = stack.pop()
      const left = stack.pop()
      if (left === undefined || right === undefined) throw calculationError('Invalid formula expression')
      if (token === '/' && right === 0) throw calculationError('Formula cannot divide by zero')
      stack.push(token === '+' ? left + right : token === '-' ? left - right : token === '*' ? left * right : left / right)
    }
  }
  if (stack.length !== 1 || !Number.isFinite(stack[0])) throw calculationError('Invalid formula result')
  return stack[0]
}

function roundAmount(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function calculateSalaryRules(rules, inputs = {}) {
  const orderedRules = [...rules].filter((rule) => rule.active !== false).sort((left, right) => left.sequence - right.sequence)
  const values = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key.toUpperCase(), Number(value) || 0]))
  const lines = []

  for (const rule of orderedRules) {
    const code = rule.code.toUpperCase()
    for (const dependency of rule.dependsOn || []) {
      if (values[dependency.toUpperCase()] === undefined) throw calculationError(`Rule ${code} depends on ${dependency}, which has not been calculated`)
    }
    let amount
    if (rule.amountType === 'fixed') amount = code === 'BASIC' && values.BASIC !== undefined ? values.BASIC : Number(rule.amount)
    if (rule.amountType === 'percentage') {
      const base = (rule.dependsOn || []).reduce((total, dependency) => total + (values[dependency.toUpperCase()] || 0), 0)
      amount = base * (Number(rule.percentage) / 100)
    }
    if (rule.amountType === 'formula') amount = evaluateFormula(rule.formula, values)
    if (!Number.isFinite(amount)) throw calculationError(`Rule ${code} produced an invalid amount`)
    amount = roundAmount(amount)
    values[code] = amount
    lines.push({ code, name: rule.name, category: rule.category, sequence: rule.sequence, quantity: 1, rate: rule.percentage || 100, amount })
  }

  const explicitGross = values.GROSS
  const grossAmount = roundAmount(explicitGross !== undefined
    ? explicitGross
    : lines.filter((line) => ['basic', 'allowance'].includes(line.category)).reduce((sum, line) => sum + line.amount, 0))
  const deductionAmount = roundAmount(lines.filter((line) => ['deduction', 'contribution'].includes(line.category)).reduce((sum, line) => sum + line.amount, 0))
  const netAmount = roundAmount(values.NET !== undefined ? values.NET : grossAmount - deductionAmount)
  return { lines, values, grossAmount, deductionAmount, netAmount }
}

export { evaluateFormula }
