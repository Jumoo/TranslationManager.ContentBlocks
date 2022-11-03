using System;

using Jumoo.TranslationManager.Core;
using Jumoo.TranslationManager.Core.Extensions;
using Jumoo.TranslationManager.Core.Models;
using Jumoo.TranslationManager.Core.ValueMappers;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

#if NETCOREAPP
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;
using Microsoft.Extensions.Logging;
#else
using Umbraco.Core;
using Umbraco.Core.Services;
using Jumoo.TranslationManager.Logging;
#endif

namespace Jumoo.TranslationManager.ContentBlocks
{
    /// <summary>
    ///  Value Mapper (TranslationManager) for Perplex.ContentBlocks
    /// </summary>
    /// <remarks>
    ///  This mapper manages the TranslationValue (and nested values)
    ///  for the ContentBlocks, which allows us to just send the text
    ///  for translation.
    /// </remarks>
    public class ContentBlocksValueMapper : BaseValueMapper, IPropertyValueMapper
    {
        private readonly Lazy<ValueMapperCollection> _valueMappers;

        public ContentBlocksValueMapper(
            IContentService contentService,
            IDataTypeService dataTypeService,
            IContentTypeService contentTypeService,
            ILogger<BaseValueMapper> logger,
            Lazy<ValueMapperCollection> valueMappers)
            : base(contentService, dataTypeService, contentTypeService, logger)
        {
            _valueMappers = valueMappers;
        }

        public string Name => "Content Blocks";

        public override string[] Editors => new string[] { "Perplex.ContentBlocks" };

        public TranslationValue GetSourceValue(string displayName, string propertyTypeAlias, object value, CultureInfoView culture)
            => GetSourceValue(displayName, propertyTypeAlias, string.Empty, value, culture);

        public TranslationValue GetSourceValue(string displayName, string propertyTypeAlias, string path, object value, CultureInfoView culture)
        {
            var jsonValue = GetJson(value);
            if (jsonValue == null) return null;

            // we support v2 of the object. 
            if (!jsonValue.ContainsKey("version") || jsonValue.Value<int>("version") != 2)
                return null;

            // set up a translation value, as the parent for header & blocks
            var translation = new TranslationValue(displayName, propertyTypeAlias, path);

            if (jsonValue.ContainsKey("header"))
            {
                // get the header
                var headerValue = GetBlockValue("header", path.AppendPath("header"), jsonValue["header"], culture);
                if (headerValue != null)
                {
                    translation.InnerValues.Add("header", headerValue);
                }
            }

            if (jsonValue.ContainsKey("blocks"))
            {
                // get the blocks.
                var blocks = jsonValue.Value<JArray>("blocks");
                for (int b = 0; b < blocks.Count; b++)
                {
                    var blockValue = GetBlockValue($"block [{b}]", path.AppendPath($"block_{b}"), blocks[b], culture);
                    if (blockValue != null)
                    {
                        var blockKey = blocks[b].Value<string>("id");
                        translation.InnerValues.Add(blockKey, blockValue);
                    }
                }
            }

            return translation;
        }

        /// <summary>
        ///  get the translation of the block (falls through to nested content)
        /// </summary>
        private TranslationValue GetBlockValue(string displayName, string path, JToken block, CultureInfoView culture)
        {
            if (block == null) return null;
            if (block is JObject jBlock)
            {
                if (!jBlock.ContainsKey("content")) return null;
                var content = jBlock.Value<JArray>("content");

                return _valueMappers.Value.GetMapperSource(
                    displayName,
                    Constants.PropertyEditors.Aliases.NestedContent,
                    path,
                    content,
                    culture);
            }

            return null;
        }

        /// <summary>
        ///  get the translated value, back into an object we can put in umbraco
        /// </summary>
        public object GetTargetValue(string propertyTypeAlias, object sourceValue, TranslationValue values, CultureInfoView sourceCulture, CultureInfoView targetCulture)
        {
            var jsonValue = GetJson(sourceValue);
            if (jsonValue == null) return sourceValue;

            if (jsonValue.ContainsKey("header"))
            {
                var headerValue = values.GetInnerValue("header");
                if (headerValue != null)
                {
                    var translatedValue = GetBlockTranslation(jsonValue["header"], headerValue, sourceCulture, targetCulture);
                    if (translatedValue != null)
                    {
                        jsonValue["header"] = translatedValue;
                    }
                }
            }

            if (jsonValue.ContainsKey("blocks"))
            {
                // get the blocks.
                var blocks = jsonValue.Value<JArray>("blocks");
                for (int b = 0; b < blocks.Count; b++)
                {
                    var blockKey = blocks[b].Value<string>("id");
                    var blockValue = values.GetInnerValue(blockKey);
                    if (blockValue != null)
                    {
                        var translatedBlock = GetBlockTranslation(blocks[b], blockValue, sourceCulture, targetCulture);
                        if (translatedBlock != null)
                        {
                            blocks[b] = translatedBlock;
                        }
                    }
                }
            }

            return JsonConvert.SerializeObject(jsonValue, Formatting.Indented);
        }

        private JToken GetBlockTranslation(JToken value, TranslationValue translationValue, CultureInfoView sourceCulture, CultureInfoView targetCulture)
        {
            if (value is JObject jValue)
            {
                if (jValue.ContainsKey("content"))
                {
                    var content = jValue.Value<JArray>("content");

                    var result = (string)_valueMappers.Value.GetMapperTarget(
                        Constants.PropertyEditors.Aliases.NestedContent,
                        content,
                        translationValue,
                        sourceCulture,
                        targetCulture);

                    if (result != null)
                    {
                        value["content"] = JToken.Parse(result);
                    }
                }
            }

            return value;
        }

        /// <summary>
        ///  gets us a json object. 
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        private JObject GetJson(object value)
        {
            var stringValue = base.GetStringValue(value);
            if (stringValue == null) return null;

            if (!stringValue.DetectIsJson()) return null;
            return JsonConvert.DeserializeObject<JObject>(stringValue);
        }

    }
}
