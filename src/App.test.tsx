import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('geometry lab', () => {
  it('introduces the app as an inspection-only proof of concept', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Pattern geometry, grounded in your measurements/ })).toBeInTheDocument();
    expect(screen.getByText('REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN')).toBeInTheDocument();
    expect(screen.getByText('SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD', { selector: '.synthetic-tag' })).toBeInTheDocument();
    expect(screen.getByText('125 mm')).toBeInTheDocument();
  });

  it('shows a blocking validation result when the synthetic value is not positive', async () => {
    const user = userEvent.setup();
    render(<App />);
    const measurementInput = screen.getByLabelText('Torso length value');
    await user.clear(measurementInput);
    await user.type(measurementInput, '0');

    expect(screen.getByText('BLOCKED', { selector: '.result-status' })).toBeInTheDocument();
    expect(screen.getByText(/NON POSITIVE VALUE/)).toBeInTheDocument();
    expect(screen.queryByText('0 mm')).not.toBeInTheDocument();
  });

  it('reports an empty raw value as missing instead of substituting zero', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByLabelText('Torso length value'));

    expect(screen.getByText('MISSING VALUE')).toBeInTheDocument();
    expect(screen.queryByText('0 mm')).not.toBeInTheDocument();
  });

  it('shows the status when an optional unimplemented rule is requested', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('checkbox')[0]!);

    const results = screen.getByLabelText('Validation and rule results');
    expect(within(results).getAllByText('NOT IMPLEMENTED').length).toBeGreaterThan(1);
  });

  it('reports dependency and reference QA statuses separately', () => {
    render(<App />);

    const results = screen.getByLabelText('Validation and rule results');
    expect(within(results).getAllByText('SATISFIED')).toHaveLength(2);
    expect(within(results).getAllByText(/seam geometry/)).toHaveLength(2);
    expect(within(results).getAllByText('NOT IMPLEMENTED').length).toBeGreaterThan(0);
  });

  it('keeps edited source provenance and blocks an absent source', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('RAW INPUT PROVENANCE'));
    const source = screen.getByLabelText('Source');
    await user.clear(source);

    expect(screen.getByText('MISSING SOURCE')).toBeInTheDocument();
    expect(screen.queryByText('125 mm')).not.toBeInTheDocument();
  });

  it('shows a transformed instance while retaining canonical local coordinates', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByLabelText('Rotation degrees counter-clockwise'));
    await user.type(screen.getByLabelText('Rotation degrees counter-clockwise'), '90');

    expect(screen.getAllByText('(125.00, 0.00) mm')).toHaveLength(2);
    expect(screen.getAllByText('(0, -125) mm')).toHaveLength(2);
  });
});
