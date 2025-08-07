import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileUpload from '../FileUpload';

describe('FileUpload', () => {
  const mockOptions = {
    renderQuality: 2.0,
    compressionLevel: 2,
    timeoutMs: 30000
  };

  const mockOnFileSelect = vi.fn();
  const mockOnOptionsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area and options', () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    expect(screen.getByText('Drop PDF file here or click to select')).toBeInTheDocument();
    expect(screen.getByText('Select File')).toBeInTheDocument();
    expect(screen.getByLabelText(/Render Quality/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Compression Level/)).toBeInTheDocument();
  });

  it('handles file selection through input', async () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    const file = new File(['test pdf content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Select PDF file/);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(file, mockOptions);
    });
  });

  it('handles drag and drop', async () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    const file = new File(['test pdf content'], 'test.pdf', { type: 'application/pdf' });
    const dropArea = screen.getByText('Drop PDF file here or click to select').closest('div');
    
    fireEvent.drop(dropArea!, {
      dataTransfer: {
        files: [file]
      }
    });
    
    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(file, mockOptions);
    });
  });

  it('rejects non-PDF files', async () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Select PDF file/);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  it('updates render quality option', () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    const qualitySlider = screen.getByLabelText(/Render Quality/);
    fireEvent.change(qualitySlider, { target: { value: '3.0' } });
    
    expect(mockOnOptionsChange).toHaveBeenCalledWith({
      ...mockOptions,
      renderQuality: 3.0
    });
  });

  it('updates compression level option', () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    const compressionSlider = screen.getByLabelText(/Compression Level/);
    fireEvent.change(compressionSlider, { target: { value: '1' } });
    
    expect(mockOnOptionsChange).toHaveBeenCalledWith({
      ...mockOptions,
      compressionLevel: 1
    });
  });

  it('displays current option values', () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    expect(screen.getByText('2.0')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles drag over and drag leave events', () => {
    render(
      <FileUpload 
        options={mockOptions}
        onFileSelect={mockOnFileSelect}
        onOptionsChange={mockOnOptionsChange}
      />
    );
    
    const dropArea = screen.getByText('Drop PDF file here or click to select').closest('div');
    
    fireEvent.dragOver(dropArea!);
    expect(dropArea).toHaveClass('border-blue-400');
    
    fireEvent.dragLeave(dropArea!);
    expect(dropArea).not.toHaveClass('border-blue-400');
  });
});
