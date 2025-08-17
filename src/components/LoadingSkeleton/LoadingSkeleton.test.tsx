import { render, screen } from '@testing-library/react';
import LoadingSkeleton from './index';

describe('LoadingSkeleton', () => {
  it('should render correctly', () => {
    render(<LoadingSkeleton />);

    // Check that skeleton elements are rendered
    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(5); // Default shows 5 skeleton items
  });

  it('should render with correct number of skeleton items', () => {
    const count = 3;
    render(<LoadingSkeleton count={count} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(count);
  });

  it('should render with default count when no count prop is provided', () => {
    render(<LoadingSkeleton />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(5);
  });

  it('should render with custom count when provided', () => {
    const customCount = 10;
    render(<LoadingSkeleton count={customCount} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(customCount);
  });

  it('should handle count of 0', () => {
    render(<LoadingSkeleton count={0} />);

    const skeletonElements = screen.queryAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(0);
  });

  it('should handle negative count gracefully', () => {
    render(<LoadingSkeleton count={-5} />);

    const skeletonElements = screen.queryAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(0);
  });

  it('should handle very large count', () => {
    const largeCount = 100;
    render(<LoadingSkeleton count={largeCount} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(largeCount);
  });

  it('should render skeleton items with proper structure', () => {
    render(<LoadingSkeleton count={2} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');

    skeletonElements.forEach(element => {
      expect(element).toHaveClass('animate-pulse');
      expect(element).toHaveClass('bg-gray-200');
      expect(element).toHaveClass('rounded-lg');
      expect(element).toHaveClass('h-16');
    });
  });

  it('should have proper spacing between skeleton items', () => {
    render(<LoadingSkeleton count={3} />);

    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveClass('space-y-3');
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSkeleton />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');

    skeletonElements.forEach(element => {
      expect(element).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('should render with proper container structure', () => {
    render(<LoadingSkeleton />);

    const container = screen.getByTestId('skeleton-container');
    expect(container).toBeInTheDocument();
    expect(container.tagName).toBe('DIV');
  });

  it('should handle undefined count prop', () => {
    render(<LoadingSkeleton count={undefined as any} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(5); // Should default to 5
  });

  it('should handle null count prop', () => {
    render(<LoadingSkeleton count={null as any} />);

    // When count is null, it should default to 5
    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(5);
  });

  it('should handle string count prop gracefully', () => {
    render(<LoadingSkeleton count={'3' as any} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(3);
  });

  it('should handle decimal count prop gracefully', () => {
    render(<LoadingSkeleton count={3.7 as any} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(3); // Should truncate to 3
  });

  it('should render skeleton items with consistent styling', () => {
    render(<LoadingSkeleton count={4} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');

    skeletonElements.forEach(element => {
      expect(element).toHaveClass('animate-pulse');
      expect(element).toHaveClass('bg-gray-200');
      expect(element).toHaveClass('rounded-lg');
      expect(element).toHaveClass('h-16');
    });
  });

  it('should have proper animation classes', () => {
    render(<LoadingSkeleton />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');

    skeletonElements.forEach(element => {
      expect(element).toHaveClass('animate-pulse');
    });
  });

  it('should have proper background color classes', () => {
    render(<LoadingSkeleton />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');

    skeletonElements.forEach(element => {
      expect(element).toHaveClass('bg-gray-200');
    });
  });

  it('should have proper border radius classes', () => {
    render(<LoadingSkeleton />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');

    skeletonElements.forEach(element => {
      expect(element).toHaveClass('rounded-lg');
    });
  });

  it('should have proper height classes', () => {
    render(<LoadingSkeleton />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');

    skeletonElements.forEach(element => {
      expect(element).toHaveClass('h-16');
    });
  });

  it('should render with proper spacing classes', () => {
    render(<LoadingSkeleton />);

    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveClass('space-y-3');
  });

  it('should handle edge case count values', () => {
    const edgeCases = [0, 1, 999, -1, -999];

    edgeCases.forEach(count => {
      const { unmount } = render(<LoadingSkeleton count={count} />);

      if (count > 0) {
        const skeletonElements = screen.getAllByTestId('skeleton-item');
        expect(skeletonElements).toHaveLength(Math.max(0, count));
      } else {
        const skeletonElements = screen.queryAllByTestId('skeleton-item');
        expect(skeletonElements).toHaveLength(0);
      }

      unmount();
    });
  });

  it('should maintain consistent DOM structure', () => {
    render(<LoadingSkeleton count={3} />);

    const container = screen.getByTestId('skeleton-container');
    const skeletonElements = screen.getAllByTestId('skeleton-item');

    expect(container).toContainElement(skeletonElements[0]);
    expect(container).toContainElement(skeletonElements[1]);
    expect(container).toContainElement(skeletonElements[2]);
  });

  it('should handle rapid re-renders gracefully', () => {
    const { rerender } = render(<LoadingSkeleton count={2} />);

    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(2);

    rerender(<LoadingSkeleton count={5} />);
    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(5);

    rerender(<LoadingSkeleton count={1} />);
    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(1);
  });

  it('should have proper test IDs for testing', () => {
    render(<LoadingSkeleton />);

    expect(screen.getByTestId('skeleton-container')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(5);
  });

  it('should render skeleton items in correct order', () => {
    render(<LoadingSkeleton count={3} />);

    const skeletonElements = screen.getAllByTestId('skeleton-item');
    expect(skeletonElements).toHaveLength(3);

    // Verify they are in the correct order in the DOM
    const container = screen.getByTestId('skeleton-container');
    expect(container.children[0]).toBe(skeletonElements[0]);
    expect(container.children[1]).toBe(skeletonElements[1]);
    expect(container.children[2]).toBe(skeletonElements[2]);
  });
});
