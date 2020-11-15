interface Action {
  type: string;
}

interface MessageAction extends Action {
  type: 'message';
  payload: string;
}

interface ReloadPageAction extends Action {
  type: 'reloadPage';
  payload: {
    pathname: string;
  };
}

interface SetClientPathnameAction extends Action {
  type: 'setClientPathname';
  payload: {
    pathname: string;
  };
}

export type HotReloadAction =
  | MessageAction
  | ReloadPageAction
  | SetClientPathnameAction;
