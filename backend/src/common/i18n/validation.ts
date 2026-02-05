import { Language } from './language';

const frPatterns: Array<{ pattern: RegExp; replace: string }> = [
  {
    pattern: /^property (.+) should not exist$/,
    replace: 'La propriete $1 ne doit pas etre fournie',
  },
  {
    pattern: /^(.+) should not be empty$/,
    replace: 'Le champ $1 est obligatoire',
  },
  {
    pattern: /^(.+) must be an email$/,
    replace: 'Le champ $1 doit etre une adresse email valide',
  },
  {
    pattern: /^(.+) must be a string$/,
    replace: 'Le champ $1 doit etre une chaine de caracteres',
  },
  {
    pattern: /^(.+) must be a boolean$/,
    replace: 'Le champ $1 doit etre vrai ou faux',
  },
  {
    pattern: /^(.+) must be a number$/,
    replace: 'Le champ $1 doit etre un nombre',
  },
  {
    pattern: /^(.+) must be a number conforming to the specified constraints$/,
    replace: 'Le champ $1 doit etre un nombre valide',
  },
  {
    pattern: /^(.+) must be a positive number$/,
    replace: 'Le champ $1 doit etre un nombre positif',
  },
  {
    pattern: /^(.+) must be a negative number$/,
    replace: 'Le champ $1 doit etre un nombre negatif',
  },
  {
    pattern: /^(.+) must be an integer number$/,
    replace: 'Le champ $1 doit etre un nombre entier',
  },
  {
    pattern: /^(.+) must be an array$/,
    replace: 'Le champ $1 doit etre un tableau',
  },
  {
    pattern: /^(.+) must be a mongodb id$/,
    replace: 'Le champ $1 doit etre un identifiant valide',
  },
  {
    pattern: /^(.+) must be one of the following values: (.+)$/,
    replace: "Le champ $1 doit etre l'une des valeurs suivantes : $2",
  },
  {
    pattern: /^(.+) must be longer than or equal to (\d+) characters$/,
    replace: 'Le champ $1 doit contenir au moins $2 caracteres',
  },
  {
    pattern: /^(.+) must be shorter than or equal to (\d+) characters$/,
    replace: 'Le champ $1 doit contenir au maximum $2 caracteres',
  },
  {
    pattern: /^(.+) must match (.+)$/,
    replace: 'Le champ $1 doit correspondre au format requis',
  },
  {
    pattern: /^(.+) must be a valid date$/,
    replace: 'Le champ $1 doit etre une date valide',
  },
];

export function translateValidationMessage(
  message: string,
  language: Language,
): string {
  if (language !== 'fr') return message;

  for (const rule of frPatterns) {
    if (rule.pattern.test(message)) {
      return message.replace(rule.pattern, rule.replace);
    }
  }

  return message;
}

export function translateValidationMessages(
  messages: string[],
  language: Language,
): string[] {
  return messages.map((msg) => translateValidationMessage(msg, language));
}
