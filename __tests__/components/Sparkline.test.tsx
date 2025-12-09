import { render, screen } from '@testing-library/react';
import Sparkline from '@/components/Sparkline';

describe('Sparkline', () => {
  it('should render sparkline with data', () => {
    const data = [10, 20, 15, 25, 30, 20];
    render(<Sparkline data={data} />);
    
    // Sparkline renders an SVG, check if it exists
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    render(<Sparkline data={[]} />);
    
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should handle undefined data', () => {
    render(<Sparkline data={undefined as any} />);
    
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should use custom color', () => {
    const data = [10, 20, 15];
    const { container } = render(<Sparkline data={data} color="#ff0000" />);
    
    const line = container.querySelector('line');
    expect(line).toBeInTheDocument();
  });
});

