module.exports = [
  {
    regex: /\.tsx?$/,
    commands: ['eslint'],
  },
  {
    regex: /\.scss$/,
    commands: ['csscomb -tv'],
  },
  {
    regex: /\.(js|md|tsx?|scss)$/,
    commands: ['prettier --write', 'git add'],
  },
];
