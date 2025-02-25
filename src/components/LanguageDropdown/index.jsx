import { Dropdown } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

const isoMapping = {
  English: 'GB',
  Russian: 'RU',
  Polish: 'PL',
};

const languages = ['English', 'Russian', 'Polish'];

const convertIso = (countryCode) => isoMapping[countryCode] || null;

export const LanguageDropdown = () => {
  const [params, setParams] = useSearchParams();
  const currentLanguage = params.get('language') || 'English'; // Default to English if no language is set

  const handleChangeLanguage = (language) => {
    setParams({ language }); // Update the URL parameters
  };

  return (
    <Dropdown
      onSelect={(eKey) => handleChangeLanguage(eKey ?? currentLanguage)}
      className='me-3 dropdown'
    >
      <Dropdown.Toggle className='text-dark' variant=''>
        <img
          src={`https://flagsapi.com/${convertIso(currentLanguage)}/flat/64.png`}
          alt='flag'
          className='flag object-fit-contain me-2'
        />
        {currentLanguage}
      </Dropdown.Toggle>
      <Dropdown.Menu className='dropdown-menu scroll-container-y'>
        {languages.map((language, index) => (
          <Dropdown.Item eventKey={language} key={`language-${index}-${language}`}>
            <img
              src={`https://flagsapi.com/${convertIso(language)}/flat/64.png`}
              alt='flag'
              className='flag object-fit-contain me-2'
            />
            {language}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
