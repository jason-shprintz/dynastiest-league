/**
 * Conversation
 * Shared chat-bubble component for Mike & Jim analysis conversations.
 * Consumed by TradeCard, DraftPickCard, and TeamDraftGradeCard.
 */

import type { SpeakerConfig } from '../speakers';
import { COLORS } from '../../../theme/colors';
import {
  ConversationWrapper,
  MessageGroupWrapper,
  SpeakerLabel,
  BubbleRow,
  AvatarImg,
  AvatarSpacer,
  Bubble,
} from './Conversation.styles';

export interface ConversationMessage {
  speaker: string;
  text: string;
}

interface ConversationProps {
  messages: ConversationMessage[];
  /**
   * Per-speaker configuration keyed by speaker name.
   * Use `MIKE_AND_JIM_SPEAKERS` from `../speakers` for the standard analyst pair.
   */
  speakers: Record<string, SpeakerConfig>;
  /**
   * 'compact' reduces padding, avatar size, and font size for tight card layouts
   * (e.g. draft pick cells). Default is 'default'.
   */
  variant?: 'default' | 'compact';
}

interface MessageGroup {
  speaker: string;
  messages: ConversationMessage[];
}

function groupMessages(messages: ConversationMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.speaker === msg.speaker) {
      last.messages.push(msg);
    } else {
      groups.push({ speaker: msg.speaker, messages: [msg] });
    }
  }
  return groups;
}

export const Conversation = ({
  messages,
  speakers,
  variant = 'default',
}: ConversationProps) => {
  const compact = variant === 'compact';
  const groups = groupMessages(messages);

  return (
    <ConversationWrapper>
      {groups.map((group, groupIdx) => {
        const config = speakers[group.speaker];
        if (!config) {
          // Unknown speaker — render messages as plain text so content isn't silently dropped
          return (
            <MessageGroupWrapper key={`unknown-${groupIdx}`} $isLeft>
              {group.messages.map((msg, msgIdx) => (
                <Bubble
                  key={`${groupIdx}-${msgIdx}`}
                  $color={COLORS.secondary}
                  $isLeft
                  $isFirst={msgIdx === 0}
                  $compact={compact}
                >
                  <strong>{group.speaker}:</strong> {msg.text}
                </Bubble>
              ))}
            </MessageGroupWrapper>
          );
        }

        const isLeft = config.side === 'left';

        return (
          <MessageGroupWrapper key={`${group.speaker}-${groupIdx}`} $isLeft={isLeft}>
            <SpeakerLabel
              $nameColor={config.nameColor}
              $isLeft={isLeft}
              $compact={compact}
            >
              {group.speaker}
            </SpeakerLabel>

            {group.messages.map((msg, msgIdx) => {
              const isFirst = msgIdx === 0;
              return (
                <BubbleRow key={`${groupIdx}-${msgIdx}`} $isLeft={isLeft} $compact={compact}>
                  {isLeft &&
                    (isFirst ? (
                      <AvatarImg
                        src={config.avatar}
                        alt=""
                        $compact={compact}
                      />
                    ) : (
                      <AvatarSpacer $compact={compact} />
                    ))}

                  <Bubble
                    $color={config.color}
                    $isLeft={isLeft}
                    $isFirst={isFirst}
                    $compact={compact}
                  >
                    {msg.text}
                  </Bubble>

                  {!isLeft &&
                    (isFirst ? (
                      <AvatarImg
                        src={config.avatar}
                        alt=""
                        $compact={compact}
                      />
                    ) : (
                      <AvatarSpacer $compact={compact} />
                    ))}
                </BubbleRow>
              );
            })}
          </MessageGroupWrapper>
        );
      })}
    </ConversationWrapper>
  );
};
