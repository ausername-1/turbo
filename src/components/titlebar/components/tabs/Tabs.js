import { Tab } from './components/Tab';
import { NewTab } from './components/NewTab';
import { Controls } from './components/Controls';

export const Tabs = props => {

  const createTab = () => {
    window.ipcRenderer.send('create-tab');
  }

  const setActiveTab = (id) => {
    window.ipcRenderer.send('set-active-tab', id);
  }

  const closeTab = (id) => {
    window.ipcRenderer.send('close-tab', id);
  }

  const onHome = () => void(0);

  return (
    <div className="TabBar flex flex-row items-center justify-start h-full space-x-6">
      <Controls
        onHome={onHome}
        tablist={props.tablist}
      />
      <div className="flex flex-row items-center justify-start h-full">
        { props.tablist.map((tab, index) => (
          <Tab
            id={tab.id}
            key={tab.id}
            favicon={tab.favicon}
            title={tab.title}
            active={tab.active}
            suffix={index+1 !== props.tablist.length ? !props.tablist[index+1].active : true}
            setActiveTab={setActiveTab}
            closeTab={closeTab}
          />
        ))}
      </div>
      <NewTab
        onClick={createTab}
      />
    </div>
  );

}