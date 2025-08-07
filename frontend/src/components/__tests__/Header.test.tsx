import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../Header';

describe('Header', () => {
  it('renders the logo and title', () => {
    render(<Header />);
    
    expect(screen.getByAltText('PDFRendr')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('PDFRendr');
  });

  it('displays version and browser information', () => {
    render(<Header />);
    
    expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
    expect(screen.getByText(/Browser-based/)).toBeInTheDocument();
  });

  it('calls onHomeClick when logo is clicked', () => {
    const mockOnHomeClick = vi.fn();
    render(<Header onHomeClick={mockOnHomeClick} />);
    
    const logo = screen.getByAltText('PDFRendr');
    fireEvent.click(logo);
    
    expect(mockOnHomeClick).toHaveBeenCalledTimes(1);
  });

  it('calls onHomeClick when title is clicked', () => {
    const mockOnHomeClick = vi.fn();
    render(<Header onHomeClick={mockOnHomeClick} />);
    
    const title = screen.getByRole('heading', { level: 1 });
    fireEvent.click(title);
    
    expect(mockOnHomeClick).toHaveBeenCalledTimes(1);
  });

  it('renders correctly without onHomeClick prop', () => {
    render(<Header />);
    
    const logo = screen.getByAltText('PDFRendr');
    const title = screen.getByRole('heading', { level: 1 });
    
    // Should not throw when clicked without handler
    fireEvent.click(logo);
    fireEvent.click(title);
    
    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });
});
