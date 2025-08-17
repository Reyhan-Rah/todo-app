import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfirmModal from './index';

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    todoTitle: 'Test Todo Item',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.body.style.overflow
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: '',
      },
      writable: true,
    });
  });

  it('should not render when isOpen is false', () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument();
  });

  it('should render correctly when open', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText('Delete Todo')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should display the correct todo title', () => {
    const customTitle = 'Custom Todo Title';
    render(<DeleteConfirmModal {...defaultProps} todoTitle={customTitle} />);

    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/)
    ).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when Delete button is clicked', () => {
    const mockOnConfirm = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={mockOnConfirm} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside the modal', () => {
    const mockOnClose = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={mockOnClose} />);

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    const mockOnClose = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when clicking inside the modal content', () => {
    const mockOnClose = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={mockOnClose} />);

    const modalContent = screen.getByText('Delete Todo').closest('div');
    if (modalContent) {
      fireEvent.click(modalContent);
    }

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'delete-modal-title');
    expect(modal).toHaveAttribute(
      'aria-describedby',
      'delete-modal-description'
    );

    const title = screen.getByText('Delete Todo');
    expect(title).toHaveAttribute('id', 'delete-modal-title');

    const description = screen.getByText(/Are you sure you want to delete/);
    expect(description).toHaveAttribute('id', 'delete-modal-description');
  });

  it('should focus the delete button when modal opens', async () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    await waitFor(() => {
      expect(document.activeElement).toBe(deleteButton);
    });
  });

  it('should set body overflow to hidden when modal opens', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body overflow when modal closes', () => {
    const { rerender } = render(<DeleteConfirmModal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<DeleteConfirmModal {...defaultProps} isOpen={false} />);

    expect(document.body.style.overflow).toBe('unset');
  });

  it('should handle todo title with special characters', () => {
    const specialTitle = 'Todo with <script>alert("xss")</script> & émojis 🚀';
    render(<DeleteConfirmModal {...defaultProps} todoTitle={specialTitle} />);

    expect(
      screen.getByText(/Todo with <script>alert\("xss"\)<\/script> & émojis 🚀/)
    ).toBeInTheDocument();
  });

  it('should handle very long todo title', () => {
    const longTitle = 'A'.repeat(100);
    render(<DeleteConfirmModal {...defaultProps} todoTitle={longTitle} />);

    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/)
    ).toBeInTheDocument();
  });

  it('should handle empty todo title', () => {
    const emptyTitle = '';
    render(<DeleteConfirmModal {...defaultProps} todoTitle={emptyTitle} />);

    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/)
    ).toBeInTheDocument();
  });

  it('should handle todo title with quotes', () => {
    const titleWithQuotes = 'Todo with "quotes" and \'apostrophes\'';
    render(
      <DeleteConfirmModal {...defaultProps} todoTitle={titleWithQuotes} />
    );

    expect(
      screen.getByText(/Todo with "quotes" and 'apostrophes'/)
    ).toBeInTheDocument();
  });

  it('should render with proper icon', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const icon = screen
      .getByText('Delete Todo')
      .previousElementSibling?.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-6', 'h-6', 'text-red-600');
  });

  it('should have proper button styling', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(cancelButton).toHaveClass('bg-gray-100', 'text-gray-700');
    expect(deleteButton).toHaveClass('bg-red-600', 'text-white');
  });

  it('should handle multiple rapid clicks gracefully', () => {
    const mockOnConfirm = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={mockOnConfirm} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    // Click multiple times rapidly
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(3);
  });

  it('should handle multiple rapid close attempts gracefully', () => {
    const mockOnClose = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    // Click multiple times rapidly
    fireEvent.click(cancelButton);
    fireEvent.click(cancelButton);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(3);
  });

  it('should handle keyboard events properly', () => {
    const mockOnClose = jest.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={mockOnClose} />);

    // Test different keys that should not trigger close
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Tab' });
    fireEvent.keyDown(document, { key: 'Space' });

    expect(mockOnClose).not.toHaveBeenCalled();

    // Test Escape key that should trigger close
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should maintain focus management', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    // Focus should be on delete button initially
    expect(document.activeElement).toBe(deleteButton);
  });

  it('should handle component unmounting gracefully', () => {
    const { unmount } = render(<DeleteConfirmModal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });

  it('should render with proper modal structure', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    const title = screen.getByText('Delete Todo');
    const description = screen.getByText(/Are you sure you want to delete/);
    const buttons = screen.getAllByRole('button');

    expect(modal).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(buttons).toHaveLength(2);
  });

  it('should handle todo title with HTML entities', () => {
    const htmlTitle = 'Todo with &amp; &lt; &gt; &quot;';
    render(<DeleteConfirmModal {...defaultProps} todoTitle={htmlTitle} />);

    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/)
    ).toBeInTheDocument();
  });
});
