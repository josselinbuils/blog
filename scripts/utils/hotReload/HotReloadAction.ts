interface Action {
  type: string;
}

interface MessageAction extends Action {
  type: 'message';
  payload: string;
}

interface ReloadCSSAction extends Action {
  type: 'reloadCSS';
  payload: {
    css: string;
    id: string;
  };
}

interface ReloadPageAction extends Action {
  type: 'reloadPage';
  payload: {
    pathname: string;
  };
}

export type HotReloadAction =
  | MessageAction
  | ReloadCSSAction
  | ReloadPageAction;
