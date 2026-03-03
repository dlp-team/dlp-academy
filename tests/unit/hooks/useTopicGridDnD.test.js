import { describe, it, expect, vi } from 'vitest';
import useTopicGridDnD from '../../../src/pages/Subject/hooks/useTopicGridDnD';

const createEvent = (sourceTopicId = '') => {
  const dataTransfer = {
    setData: vi.fn(),
    getData: vi.fn(() => sourceTopicId),
    effectAllowed: '',
    dropEffect: '',
  };

  return {
    preventDefault: vi.fn(),
    dataTransfer,
  };
};

describe('useTopicGridDnD', () => {
  it('sets drag payload and move effect on drag start', () => {
    const { handleDragStart } = useTopicGridDnD();
    const event = createEvent();

    handleDragStart(event, 'topic-1');

    expect(event.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'topic-1');
    expect(event.dataTransfer.effectAllowed).toBe('move');
  });

  it('enables dropping on drag over', () => {
    const { handleDragOver } = useTopicGridDnD();
    const event = createEvent();

    handleDragOver(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.dataTransfer.dropEffect).toBe('move');
  });

  it('calls reorder callback when source and target differ', () => {
    const onReorderTopics = vi.fn();
    const { handleDrop } = useTopicGridDnD(onReorderTopics);
    const event = createEvent('topic-source');

    handleDrop(event, 'topic-target');

    expect(onReorderTopics).toHaveBeenCalledWith('topic-source', 'topic-target');
  });

  it('does not call reorder callback when dropping on same topic', () => {
    const onReorderTopics = vi.fn();
    const { handleDrop } = useTopicGridDnD(onReorderTopics);
    const event = createEvent('topic-same');

    handleDrop(event, 'topic-same');

    expect(onReorderTopics).not.toHaveBeenCalled();
  });
});
