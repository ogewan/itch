import React from "react";
import { connect, Dispatchers, actionCreatorsList } from "./connect";

import { IMeatProps } from "renderer/components/meats/types";

import Games from "./games";

import { Space } from "common/helpers/space";

import styled, * as styles from "./styles";

import Link from "./basics/link";
import LocationTitleBarExtra from "./location-title-bar-extra";
import FiltersContainer from "./filters-container";
import { showInExplorerString } from "common/format/show-in-explorer";
import { GameColumn } from "./game-table/table";
import { T } from "renderer/t";

const columns = [
  GameColumn.Cover,
  GameColumn.Title,
  GameColumn.LastPlayed,
  GameColumn.PlayTime,
  GameColumn.InstalledSize,
  GameColumn.InstallStatus,
];

const LocationContainer = styled.div`
  ${styles.meat()};
`;

class Location extends React.PureComponent<IProps & IDerivedProps> {
  render() {
    const { tab, tabInstance, browseInstallLocation, loading } = this.props;

    const installLocationId = Space.fromInstance(
      tabInstance
    ).firstPathElement();

    return (
      <LocationContainer>
        <FiltersContainer loading={loading}>
          <LocationTitleBarExtra tabInstance={tabInstance} />
          <Link
            label={T(showInExplorerString())}
            onClick={e => browseInstallLocation({ id: installLocationId })}
          />
        </FiltersContainer>

        <Games tab={tab} forcedLayout="table" columns={columns} ignoreFilters />
      </LocationContainer>
    );
  }
}

interface IProps extends IMeatProps {}

const actionCreators = actionCreatorsList("browseInstallLocation");

type IDerivedProps = Dispatchers<typeof actionCreators>;

export default connect<IProps>(Location, { actionCreators });
