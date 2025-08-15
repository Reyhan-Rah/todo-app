import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('should render a simple element', () => {
    render(<div data-testid="test-element">Hello World</div>)
    const element = screen.getByTestId('test-element')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello World')
  })
})
