import { Section } from '../../types';
import {
  NotFoundSection,
  StatusCode,
  Explanation,
  RequestedPath,
  SuggestionList,
  SuggestionButton,
} from './NotFound.styles';

interface INotFoundProps {
  onNavigate: (section: Section) => void;
}

interface Suggestion {
  section: Section;
  label: string;
}

const suggestions: Suggestion[] = [
  { section: 'home', label: 'Home' },
  { section: 'teams', label: 'Teams' },
  { section: 'trades', label: 'Trades' },
  { section: 'records', label: 'Hall of Records' },
  { section: 'constitution', label: 'Constitution' },
];

/**
 * Shown when the URL hash names a section that does not exist.
 *
 * Reached only by routing decision — `not-found` is absent from
 * `VALID_SECTIONS`, so no hash or NavLink can target it directly. App.tsx also
 * leaves the address bar untouched while this is the active section, so the
 * hash the visitor actually typed survives for them to read and correct.
 *
 * @param props - The component props
 * @param props.onNavigate - Callback used to route to a suggested section
 * @returns A React component explaining the bad route
 */
const NotFound = ({ onNavigate }: INotFoundProps) => {
  const attempted =
    typeof window === 'undefined' ? '' : window.location.hash.replace('#', '');

  return (
    <NotFoundSection>
      <StatusCode aria-hidden="true">404</StatusCode>
      <h2>No such page</h2>
      <Explanation>
        {attempted ? (
          <>
            There is no section called{' '}
            <RequestedPath>{attempted}</RequestedPath>. The link that brought
            you here may be out of date, or the address may have a typo.
          </>
        ) : (
          <>
            That address does not match anything on this site. The link that
            brought you here may be out of date, or the address may have a typo.
          </>
        )}
      </Explanation>
      <Explanation>Try one of these instead:</Explanation>
      <SuggestionList>
        {suggestions.map((suggestion) => (
          <li key={suggestion.section}>
            <SuggestionButton onClick={() => onNavigate(suggestion.section)}>
              {suggestion.label}
            </SuggestionButton>
          </li>
        ))}
      </SuggestionList>
    </NotFoundSection>
  );
};

export default NotFound;
