import React from 'react';
import {Image, NetInfo} from 'react-native';
import RNFS, { DocumentDirectoryPath } from 'react-native-fs';
import {LazyloadImage} from 'react-native-lazyload';

const SHA1 = require("crypto-js/sha1");
const URL = require('url-parse');

export default class CacheImage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cacheNeed: this.props.cacheNeed,
            isRemote: false,
            cachedImagePath: null,
            downloading: false,
            cacheable: true,
            jobId: null,
            networkAvailable: false
        };
        this.imageDownloadBegin = this.imageDownloadBegin.bind(this);
        this.imageDownloadProgress = this.imageDownloadProgress.bind(this);
        this._handleConnectivityChange = this._handleConnectivityChange.bind(this);

    };

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.source != this.props.source) {
    //         this._processSource(nextProps.source);
    //     }
    // }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState === this.state && nextProps === this.props) {
            return false;
        }
        return true;
    }

    async imageDownloadBegin(info) {
        this.setState({downloading: true, jobId: info.jobId});
    }

    async imageDownloadProgress(info) {
        if ((info.contentLength / info.bytesWritten) == 1) {
            this.setState({downloading: false, jobId: null});
        }
    }

    async checkImageCache(imageUri, cachePath, cacheKey) {
        const dirPath = DocumentDirectoryPath+'/'+cachePath;
        const filePath = dirPath+'/'+cacheKey;

        RNFS
            .stat(filePath)
            .then((res) => {
                if (res.isFile()) {
                    // means file exists, ie, cache-hit
                    this.setState({cacheable: true, cachedImagePath: filePath});
                }
            })
            .catch((err) => {

                // means file does not exist
                // first make sure network is available..
                if (! this.state.networkAvailable) {
                    this.setState({cacheable: false, cachedImagePath: null});
                    return;
                }

                // then make sure directory exists.. then begin download
                // The NSURLIsExcludedFromBackupKey property can be provided to set this attribute on iOS platforms.
                // Apple will reject apps for storing offline cache data that does not have this attribute.
                // https://github.com/johanneslumpe/react-native-fs#mkdirfilepath-string-options-mkdiroptions-promisevoid
                RNFS
                    .mkdir(dirPath, {NSURLIsExcludedFromBackupKey: true})
                    .then(() => {
                        // before we change the cachedImagePath.. if the previous cachedImagePath was set.. remove it
                        if (this.state.cacheable && this.state.cachedImagePath) {
                            let delImagePath = this.state.cachedImagePath;
                            this.deleteFilePath(delImagePath);
                        }

                        let downloadOptions = {
                            fromUrl: imageUri,
                            toFile: filePath,
                            background: true,
                            begin: this.imageDownloadBegin,
                            progress: this.imageDownloadProgress
                        };

                        // directory exists.. begin download
                        RNFS
                            .downloadFile(downloadOptions)
                            .promise
                            .then(() => {
                                this.setState({cacheable: true, cachedImagePath: filePath});
                            })
                            .catch((err) => {
                                // error occurred while downloading or download stopped.. remove file if created
                                this._deleteFilePath(filePath);
                                this.setState({cacheable: false, cachedImagePath: null});
                            });
                    })
                    .catch((err) => {
                        this._deleteFilePath(filePath);
                        this.setState({cacheable: false, cachedImagePath: null});
                    })
            });
    }

    _deleteFilePath(filePath) {
        RNFS
            .exists(filePath)
            .then((res) => {
                if (res) {
                    RNFS
                        .unlink(filePath)
                        .catch((err) => {});
                }
            });
    }

    _processSource(source) {
        if (source !== null
            && source != ''
            && typeof source === "object"
            && source.hasOwnProperty('uri'))
        { // remote
            const url = new URL(source.uri, null, true);

            // handle query params for cache key
            let cacheable = url.pathname;
            if (Array.isArray(this.props.useQueryParamsInCacheKey)) {
                this.props.useQueryParamsInCacheKey.forEach(function(k) {
                    if (url.query.hasOwnProperty(k)) {
                        cacheable = cacheable.concat(url.query[k]);
                    }
                });
            }
            else if (this.props.useQueryParamsInCacheKey) {
                cacheable = cacheable.concat(url.query);
            }

            // ignore extension
            const type = url.pathname.replace(/.*\.(.*)/, '$1');
            const cacheKey = SHA1(cacheable) + '.' + (type.length < url.pathname.length ? type : '');

            this.checkImageCache(source.uri, url.host, cacheKey);
            this.setState({isRemote: true});
        }
        else {
            this.setState({isRemote: false});
        }
    }

    componentWillMount() {
        NetInfo.isConnected.addEventListener('change', this._handleConnectivityChange);
        // initial
        NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({networkAvailable: isConnected});
        });
        if(!this.props.cacheNeed) {
            this._processSource(this.props.source);
        }
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('change', this._handleConnectivityChange);

        if (this.state.downloading && this.state.jobId) {
            RNFS.stopDownload(this.state.jobId);
        }
    }

    async _handleConnectivityChange(isConnected) {
        this.setState({
            networkAvailable: isConnected,
        });
    };

    render() {
        if (this.props.lazyNeed || this.props.host) {
            return this.renderLazy();
        }

        if (!this.state.isRemote) {
            return this.renderLocal();
        }

        if (this.state.cacheable && this.state.cachedImagePath) {
            return this.renderCache();
        }

        return (
            <Image source={require('../../res/thumb-avatar.png')} {...this.props} />
        );
    }

    renderCache() {
        const { children, ...props } = this.props;
        return (
            <Image {...props} source={{uri: 'file://'+this.state.cachedImagePath}}>
                {children}
            </Image>
        );
    }

    renderLocal() {
        const { children, ...props } = this.props;
        return (
            <Image {...props}>
                {children}
            </Image>
        );
    }

    renderLazy() {
        const { children, host, ...props } = this.props;
        return (
            <LazyloadImage host={host} {...props}>
                {children}
            </LazyloadImage>
        );
    }
}

CacheImage.propTypes = {
    cacheNeed: React.PropTypes.bool,
    lazyNeed: React.PropTypes.bool,
    useQueryParamsInCacheKey: React.PropTypes.oneOfType([
        React.PropTypes.bool,
        React.PropTypes.array
    ])
};


CacheImage.defaultProps = {
    cacheNeed: false,
    lazyNeed: false,
    style: { backgroundColor: 'transparent' },
    useQueryParamsInCacheKey: false,
};
