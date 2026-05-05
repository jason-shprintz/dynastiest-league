import styled from 'styled-components';
import { COLORS } from '../../../theme/colors';

const AVATAR_SIZE_DEFAULT = 36;
const AVATAR_SIZE_COMPACT = 24;
const GAP_DEFAULT = 10;
const GAP_COMPACT = 8;

// Offset from container edge to align speaker label above the bubble (avatar + gap)
const LABEL_OFFSET_DEFAULT = `${AVATAR_SIZE_DEFAULT + GAP_DEFAULT}px`; // 46px
const LABEL_OFFSET_COMPACT = `${AVATAR_SIZE_COMPACT + GAP_COMPACT}px`; // 32px

export const ConversationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const MessageGroupWrapper = styled.div<{ $isLeft: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.25rem;
  align-items: ${({ $isLeft }) => ($isLeft ? 'flex-start' : 'flex-end')};
`;

export const SpeakerLabel = styled.div<{
  $nameColor: string;
  $isLeft: boolean;
  $compact: boolean;
}>`
  font-size: ${({ $compact }) => ($compact ? '0.68rem' : '0.75rem')};
  font-weight: 700;
  color: ${({ $nameColor }) => $nameColor};
  margin-bottom: 0.15rem;
  padding-left: ${({ $isLeft, $compact }) =>
    $isLeft ? ($compact ? LABEL_OFFSET_COMPACT : LABEL_OFFSET_DEFAULT) : '0'};
  padding-right: ${({ $isLeft, $compact }) =>
    !$isLeft ? ($compact ? LABEL_OFFSET_COMPACT : LABEL_OFFSET_DEFAULT) : '0'};
`;

export const BubbleRow = styled.div<{ $isLeft: boolean; $compact: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ $compact }) => ($compact ? `${GAP_COMPACT}px` : `${GAP_DEFAULT}px`)};
  justify-content: ${({ $isLeft }) => ($isLeft ? 'flex-start' : 'flex-end')};
  width: 100%;
`;

export const AvatarImg = styled.img<{ $compact: boolean }>`
  width: ${({ $compact }) => ($compact ? `${AVATAR_SIZE_COMPACT}px` : `${AVATAR_SIZE_DEFAULT}px`)};
  height: ${({ $compact }) => ($compact ? `${AVATAR_SIZE_COMPACT}px` : `${AVATAR_SIZE_DEFAULT}px`)};
  border-radius: 50%;
  object-fit: cover;
  /* stylelint-disable-next-line property-no-unknown */
  object-view-box: inset(0 0 20% 0);
  flex-shrink: 0;
`;

export const AvatarSpacer = styled.div<{ $compact: boolean }>`
  width: ${({ $compact }) => ($compact ? `${AVATAR_SIZE_COMPACT}px` : `${AVATAR_SIZE_DEFAULT}px`)};
  flex-shrink: 0;
`;

export const Bubble = styled.div<{
  $color: string;
  $isLeft: boolean;
  $isFirst: boolean;
  $compact: boolean;
}>`
  background: ${({ $color }) => $color};
  color: ${COLORS.white};
  border-radius: ${({ $isFirst, $isLeft }) =>
    $isFirst
      ? $isLeft
        ? '4px 16px 16px 16px'
        : '16px 4px 16px 16px'
      : '16px'};
  padding: ${({ $compact }) => ($compact ? '0.3rem 0.6rem' : '0.6rem 0.9rem')};
  font-size: ${({ $compact }) => ($compact ? '0.72rem' : '0.875rem')};
  line-height: 1.5;
  max-width: 70%;
  word-wrap: break-word;
  position: relative;

  /* Tail pointing outward toward the avatar — only on the first bubble of a run */
  ${({ $isFirst, $isLeft, $color }) =>
    $isFirst && $isLeft
      ? `
    &::before {
      content: '';
      position: absolute;
      top: 8px;
      left: -8px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 6px 8px 6px 0;
      border-color: transparent ${$color} transparent transparent;
    }
  `
      : $isFirst && !$isLeft
      ? `
    &::before {
      content: '';
      position: absolute;
      top: 8px;
      right: -8px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 6px 0 6px 8px;
      border-color: transparent transparent transparent ${$color};
    }
  `
      : ''}

  @media (max-width: 480px) {
    max-width: 80%;
    font-size: ${({ $compact }) => ($compact ? '0.72rem' : '0.9rem')};
  }
`;
