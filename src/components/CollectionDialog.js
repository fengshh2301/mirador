import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  Link,
  MenuList,
  MenuItem,
  Typography,
  DialogContent,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { LabelValueMetadata } from './LabelValueMetadata';
import CollapsibleSection from '../containers/CollapsibleSection';
import SanitizedHtml from '../containers/SanitizedHtml';

/**
 */
function asArray(value) {
  if (!Array.isArray(value)) {
    return [value];
  }

  return value;
}

/**
 * a simple dialog providing the possibility to switch the theme
 */
export class CollectionDialog extends Component {
  /** */
  static getUseableLabel(resource, index) {
    return (resource
      && resource.getLabel
      && resource.getLabel().length > 0)
      ? resource.getLabel().map(label => label.value)[0]
      : String(index + 1);
  }

  /** */
  componentDidMount() {
    this.fetchManifestIfNeeded();
  }

  /** */
  componentDidUpdate(prevProps) {
    const { manifestId } = this.props;

    if (prevProps.manifestId !== manifestId) this.fetchManifestIfNeeded();
  }

  /** */
  fetchManifestIfNeeded() {
    const {
      error, fetchManifest, isFetching, manifestId, ready,
    } = this.props;

    if (!ready && !error && !isFetching) fetchManifest(manifestId, { hide: true });
  }

  /** */
  selectCollection(c) {
    const { collectionPath, manifestId, showCollectionDialog } = this.props;

    showCollectionDialog(c.id, [...collectionPath, manifestId]);
  }

  /** */
  selectManifest(m) {
    const {
      addWindow,
      collectionPath,
      hideCollectionDialog,
      manifestId,
      setWorkspaceAddVisibility,
      updateWindow,
      windowId,
    } = this.props;

    if (windowId) {
      updateWindow(windowId, { collectionPath: [...collectionPath, manifestId], manifestId: m.id });
    } else {
      addWindow({ collectionPath: [...collectionPath, manifestId], manifestId: m.id });
    }

    hideCollectionDialog();
    setWorkspaceAddVisibility(false);
  }

  /** */
  placeholder() {
    const { classes, hideCollectionDialog } = this.props;

    return (
      <Dialog
        onClose={hideCollectionDialog}
        open
      >
        <DialogTitle id="select-collection" disableTypography>
          <Skeleton className={classes.placeholder} variant="text" />
        </DialogTitle>
        <DialogContent>
          <Skeleton className={classes.placeholder} variant="text" />
          <Skeleton className={classes.placeholder} variant="text" />
        </DialogContent>
      </Dialog>
    );
  }

  /** */
  render() {
    const {
      classes,
      error,
      hideCollectionDialog,
      manifest,
      ready,
      t,
    } = this.props;

    if (error) return null;
    if (!ready) return this.placeholder();

    const rights = manifest && (manifest.getProperty('rights') || manifest.getProperty('license'));
    const requiredStatement = manifest
      && asArray(manifest.getRequiredStatement()).filter(l => l.getValue()).map(labelValuePair => ({
        label: labelValuePair.getLabel(),
        value: labelValuePair.getValue(),
      }));

    return (
      <Dialog
        onClose={hideCollectionDialog}
        open
      >
        <DialogTitle id="select-collection" disableTypography>
          <Typography variant="h2">
            {t('selectCollection')}
          </Typography>
          <Typography variant="h3">
            {CollectionDialog.getUseableLabel(manifest)}
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <CollapsibleSection
            id="select-collection-about"
            label={t('aboutThisCollection')}
          >
            <Typography variant="body1">
              <SanitizedHtml htmlString={manifest.getDescription()} ruleSet="iiif" />
            </Typography>
          </CollapsibleSection>
          <CollapsibleSection
            id="select-collection-rights"
            label={t('attributionTitle')}
          >
            { requiredStatement && (
              <LabelValueMetadata labelValuePairs={requiredStatement} defaultLabel={t('attribution')} />
            )}
            {
              rights && rights.length > 0 && (
                <>
                  <Typography variant="subtitle2" component="dt">{t('rights')}</Typography>
                  { rights.map(v => (
                    <Typography variant="body1" component="dd">
                      <Link target="_blank" rel="noopener noreferrer" href={v}>
                        {v}
                      </Link>
                    </Typography>
                  )) }
                </>
              )
            }
          </CollapsibleSection>
          {manifest.getTotalCollections()} collections
          <MenuList>
            {
              manifest.getCollections().map(c => (
                <MenuItem key={c.id} onClick={() => { this.selectCollection(c); }}>{CollectionDialog.getUseableLabel(c)}</MenuItem>
              ))
            }
          </MenuList>
          {manifest.getTotalManifests()} manifests
          <MenuList>
            {
              manifest.getManifests().map(m => (
                <MenuItem key={m.id} onClick={() => { this.selectManifest(m); }}>{CollectionDialog.getUseableLabel(m)}</MenuItem>
              ))
            }
          </MenuList>
        </DialogContent>
      </Dialog>
    );
  }
}

CollectionDialog.propTypes = {
  addWindow: PropTypes.func.isRequired,
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  collectionPath: PropTypes.arrayOf(PropTypes.string),
  error: PropTypes.string,
  fetchManifest: PropTypes.func.isRequired,
  hideCollectionDialog: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  manifest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  manifestId: PropTypes.string.isRequired,
  ready: PropTypes.bool,
  setWorkspaceAddVisibility: PropTypes.func.isRequired,
  showCollectionDialog: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  updateWindow: PropTypes.func.isRequired,
  windowId: PropTypes.string,
};

CollectionDialog.defaultProps = {
  collectionPath: [],
  error: null,
  isFetching: false,
  ready: false,
  windowId: null,
};
